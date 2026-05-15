<template>
  <div class="app-layout">
    <GobackHeader />
    <main class="app-main">
      <div class="tracker-create">
        <h2 class="page-title">Создать трекер привычек</h2>

        <div class="instructions">
          <h3>Инструкция по созданию Google Apps Script для Habit Tracker</h3>

          <ul class="steps-list">
            <li>
              <p class="step-title">1. Создать Google Sheets</p>
              <ol class="sub-steps">
                <li>Открой Google Sheets</li>
                <li>Создай новую таблицу</li>
                <li>Назови её как угодно, например Habit Tracker</li>
              </ol>
            </li>
            <li>
              <p class="step-title">2. Открыть редактор Apps Script</p>
              <p>В открытой таблице Extensions → Apps Script (или «Расширения → Apps Script»)</p>
            </li>
            <li>
              <p class="step-title">3. Создать скрипт</p>
              <p>Откроется редактор Apps Script. По умолчанию там будет файл Code.gs</p>
            </li>
            <li>
              <p class="step-title">4. Вставить код</p>
              <ol class="sub-steps">
                <li>Удали весь существующий код</li>
                <li>Вставь код Apps Script</li>
              </ol>
            </li>
          </ul>
        </div>

        <div class="code-section">
          <div class="code-header">
            <span class="code-label">Код</span>
            <button class="copy-btn" @click="copyCode">
              {{ copied ? 'Скопировано!' : 'Копировать' }}
            </button>
          </div>
          <pre class="code-block"><code>{{ GAS_CODE }}</code></pre>
        </div>

        <div class="instructions">
          <ul class="steps-list">
            <li>
              <p class="step-title">5. Сохранить проект</p>
              <p>Нажми Ctrl + S</p>
            </li>
            <li>
              <p class="step-title">6. Назвать проект</p>
              <p>Слева сверху нажми «Untitled project» и задай имя, например «Habit Tracker API»</p>
            </li>
            <li>
              <p class="step-title">7. Задеплоить Web App</p>
              <p>В правом верхнем углу нажми Deploy → New deployment</p>
            </li>
            <li>
              <p class="step-title">8. Выбрать тип деплоя</p>
              <p>Нажми Select type и выбери Web app</p>
            </li>
            <li>
              <p class="step-title">9. Настроить Web App</p>
              <p>Выставь параметры:</p>
              <ul class="sub-steps">
                <li>Execute as: Me</li>
                <li>Who has access: Anyone или Anyone with the link</li>
              </ul>
            </li>
            <li>
              <p class="step-title">10. Нажать Deploy</p>
              <p>После этого Google попросит авторизоваться и подтвердить доступ к Google Sheets</p>
            </li>
            <li>
              <p class="step-title">11. Подтвердить доступ</p>
              <p>Если появится предупреждение «Google hasn't verified this app», нажми Advanced → Go to project name → Allow. Это нормально для личного Apps Script.</p>
            </li>
            <li>
              <p class="step-title">12. Получить Deployment ID</p>
              <p>После успешного деплоя появится окно с Web app URL, например:</p>
              <p class="example">https://script.google.com/macros/s/AKfycbxxxxxxx/exec</p>
              <p>Deployment ID — это часть между <code>/s/</code> и <code>/exec</code>, то есть <code>AKfycbxxxxxxx</code></p>
            </li>
            <li>
              <p class="step-title">13. Введите Deployment ID в форму ниже.</p>
              <p>Так же придумайте и введите название вашего нового трекера привычек</p>
            </li>
          </ul>
        </div>

        <div class="form-section">
          <form @submit.prevent="handleSave" class="tracker-form">
          <FormField
            v-model="trackerNameInput"
            label="Имя трекера"
            type="text"
            required
            placeholder="Мой трекер привычек"
            :error="nameError"
          />

          <FormField
            v-model="deploymentIdInput"
            label="Введите Google Apps Script Deployment ID"
            type="text"
            required
            placeholder="AIza..."
            :error="deploymentError"
          />

          <div class="form-actions">
            <FormButton
              label="Сохранить"
              variant="primary"
              type="submit"
            />
          </div>
        </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GobackHeader from '../components/GobackHeader.vue'
import FormField from '../components/FormField.vue'
import FormButton from '../components/FormButton.vue'

const router = useRouter()

const trackerNameInput = ref('')
const deploymentIdInput = ref('')
const nameError = ref(null)
const deploymentError = ref(null)
const copied = ref(false)

const GAS_CODE = `const SETTINGS_SHEET_NAME = 'settings';
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
}`

function copyCode() {
  navigator.clipboard.writeText(GAS_CODE)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function handleSave() {
  nameError.value = null
  deploymentError.value = null

  const trimmedName = trackerNameInput.value.trim()
  const trimmedDeploymentId = deploymentIdInput.value.trim()

  let valid = true

  if (!trimmedName) {
    nameError.value = 'Введите имя трекера'
    valid = false
  }

  if (!trimmedDeploymentId) {
    deploymentError.value = 'Введите Deployment ID'
    valid = false
  }

  if (!valid) return

  localStorage.setItem('habits-settings-deploymentId', trimmedDeploymentId)
  localStorage.setItem('habits-settings-trackerName', trimmedName)
  router.push('/')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.tracker-create {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin-bottom: 24px;
}

.instructions {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.instructions h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.steps-list {
  margin: 0;
  padding-left: 20px;
  list-style-type: none;
}

.steps-list > li {
  margin-bottom: 16px;
}

.step-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  margin-left: -20px;
}

.sub-steps {
  margin: 0;
  padding-left: 20px;
}

.sub-steps li {
  margin-bottom: 4px;
  color: #555;
}

.code-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
}

.code-label {
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

.copy-btn {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  color: #333;
}

.copy-btn:hover {
  background: #f0f0f0;
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  margin: 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.tracker-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  margin-top: 8px;
}

.example {
  background: #f0f0f0;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  color: #333;
  word-break: break-all;
}

.steps-list li {
  margin-bottom: 12px;
}

.step-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.sub-steps {
  margin: 8px 0 0 20px;
  padding-left: 0;
}

.sub-steps li {
  margin-bottom: 4px;
  color: #555;
}
</style>