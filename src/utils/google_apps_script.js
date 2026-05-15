const SETTINGS_SHEET_NAME = 'settings';
const HABITS_SHEET_NAME = 'habits';

const SETTINGS_HEADERS = ['setting', 'value'];
const HABITS_HEADERS = ['id', 'name', 'levels', 'order'];

/**
 * =========================
 * HTTP HANDLERS
 * =========================
 */

function doGet(e) {
  try {
    const action = e.parameter.action;

    switch (action) {
      case 'bootstrap':
        return jsonResponse(handleBootstrap());

      default:
        return jsonResponse({
          success: false,
          error: 'Unknown GET action',
        });
    }
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.message,
    });
  }
}

function doPost(e) {
  try {
    const action = e.parameter.action;
    const body = JSON.parse(e.postData.contents || '{}');

    switch (action) {
      case 'upsertHabit':
        return jsonResponse(handleUpsertHabit(body));

      case 'deleteHabit':
        return jsonResponse(handleDeleteHabit(body));

      case 'updateSettings':
        return jsonResponse(handleUpdateSettings(body));

      default:
        return jsonResponse({
          success: false,
          error: 'Unknown POST action',
        });
    }
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.message,
    });
  }
}

/**
 * =========================
 * BOOTSTRAP
 * =========================
 */

function handleBootstrap() {
  const settingsSheet = getOrCreateSettingsSheet();
  const habitsSheet = getOrCreateHabitsSheet();

  const settings = readSettings(settingsSheet);
  const habits = readHabits(habitsSheet);

  return {
    success: true,
    settings,
    habits,
  };
}

/**
 * =========================
 * SETTINGS
 * =========================
 */

function handleUpdateSettings(data) {
  const settingsSheet = getOrCreateSettingsSheet();

  const allowedSettings = [
    'trackerName',
    'deploymentId',
    'rewardLevels',
    'dayStartHour',
  ];

  allowedSettings.forEach((key) => {
    if (data[key] !== undefined) {
      upsertSetting(settingsSheet, key, data[key]);
    }
  });

  return {
    success: true,
  };
}

function readSettings(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return {};
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, 2)
    .getValues();

  const settings = {};

  values.forEach(([key, value]) => {
    settings[key] = value;
  });

  return settings;
}

function upsertSetting(sheet, key, value) {
  const lastRow = sheet.getLastRow();

  if (lastRow >= 2) {
    const values = sheet
      .getRange(2, 1, lastRow - 1, 2)
      .getValues();

    for (let i = 0; i < values.length; i++) {
      const rowKey = values[i][0];

      if (rowKey === key) {
        sheet
          .getRange(i + 2, 2)
          .setNumberFormat('@')
          .setValue(String(value));
        return;
      }
    }
  }

  const row = sheet.getLastRow() + 1;

  const range = sheet.getRange(row, 1, 1, 2);

  range.setNumberFormats([['@', '@']]);

  range.setValues([[
    String(key),
    String(value),
  ]]);
}

/**
 * =========================
 * HABITS
 * =========================
 */

function handleUpsertHabit(habit) {
  const sheet = getOrCreateHabitsSheet();

  validateHabit(habit);

  const lastRow = sheet.getLastRow();

  if (lastRow >= 2) {
    const values = sheet
      .getRange(2, 1, lastRow - 1, 4)
      .getValues();

    for (let i = 0; i < values.length; i++) {
      const rowHabitId = values[i][0];

      if (rowHabitId === habit.id) {
        const range = sheet.getRange(i + 2, 1, 1, 4);

        range.setNumberFormats([['@', '@', '@', '0']]);

        range.setValues([[
          String(habit.id),
          String(habit.name),
          String(habit.levels),
          Number(habit.order),
        ]]);

        return {
          success: true,
          mode: 'updated',
        };
      }
    }
  }

  const row = sheet.getLastRow() + 1;

  const range = sheet.getRange(row, 1, 1, 4);

  range.setNumberFormats([['@', '@', '@', '0']]);

  range.setValues([[
    String(habit.id),
    String(habit.name),
    String(habit.levels),
    Number(habit.order),
  ]]);

  return {
    success: true,
    mode: 'created',
  };
}

function handleDeleteHabit(data) {
  const sheet = getOrCreateHabitsSheet();

  const id = data.id;

  if (!id) {
    throw new Error('Habit id is required');
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return {
      success: false,
      error: 'Habit not found',
    };
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .getValues();

  for (let i = 0; i < values.length; i++) {
    const rowHabitId = values[i][0];

    if (rowHabitId === id) {
      sheet.deleteRow(i + 2);

      return {
        success: true,
      };
    }
  }

  return {
    success: false,
    error: 'Habit not found',
  };
}

function readHabits(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, 4)
    .getValues();

  return values.map(([id, name, levels, order]) => ({
    id,
    name,
    levels,
    order,
  }));
}

function validateHabit(habit) {
  if (!habit.id) {
    throw new Error('Habit id is required');
  }

  if (!habit.name) {
    throw new Error('Habit name is required');
  }

  if (habit.levels === undefined) {
    throw new Error('Habit levels are required');
  }

  if (habit.order === undefined) {
    throw new Error('Habit order is required');
  }
}

/**
 * =========================
 * SHEETS HELPERS
 * =========================
 */

function getOrCreateSettingsSheet() {
  const sheet = getOrCreateSheet(
    SETTINGS_SHEET_NAME,
    SETTINGS_HEADERS
  );

  ensureSettingsSheetFormatting(sheet);

  return sheet;
}

function getOrCreateHabitsSheet() {
  const sheet = getOrCreateSheet(
    HABITS_SHEET_NAME,
    HABITS_HEADERS
  );

  ensureHabitsSheetFormatting(sheet);

  return sheet;
}

function getOrCreateSheet(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  ensureHeaders(sheet, headers);

  return sheet;
}

function ensureHeaders(sheet, headers) {
  const currentHeaders = sheet
    .getRange(1, 1, 1, headers.length)
    .getValues()[0];

  const isEmpty = currentHeaders.every((cell) => cell === '');

  if (isEmpty) {
    sheet
      .getRange(1, 1, 1, headers.length)
      .setValues([headers]);
  }
}

function ensureHabitsSheetFormatting(sheet) {
  // id
  sheet.getRange('A:A').setNumberFormat('@');
  // name
  sheet.getRange('B:B').setNumberFormat('@');
  // levels
  sheet.getRange('C:C').setNumberFormat('@');
  // order
  sheet.getRange('D:D').setNumberFormat('0');
}

function ensureSettingsSheetFormatting(sheet) {
  sheet.getRange('A:A').setNumberFormat('@');
  sheet.getRange('B:B').setNumberFormat('@');
}

/**
 * =========================
 * RESPONSE HELPERS
 * =========================
 */

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
