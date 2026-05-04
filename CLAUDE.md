# Habit Tracker — контекст проекта

## Обзор

Минималистичный трекер привычек (SPA) на Vue 3 + Vite. Позволяет отслеживать выполнение ежедневных привычек с несколькими уровнями выполнения. Данные хранятся в localStorage, синхронизация с Google Sheets.

## Технологический стек

- **Vue 3.4** (Composition API, `<script setup>`)
- **Vite 5.4** (сборщик)
- **@vitejs/plugin-vue 5** (плагин Vue для Vite)
- Без роутера, без Pinia — состояние в корневом компоненте

## Структура проекта

```
habits/
├── index.html                  # Точка входа: <div id="app"> + <script src="/src/main.js">
├── package.json                # Зависимости: vue 3.4, vite 5.4, @vitejs/plugin-vue 5
├── vite.config.js              # Конфиг Vite: defineConfig({ plugins: [vue()] })
├── .gitignore                  # /node_modules
├── README.md                   # Описание проекта, установка, запуск
└── src/
    ├── main.js                 # createApp(App).mount('#app'), импорт main.css
    ├── App.vue                 # Корневой компонент: состояние habits[], completed{}, totalPoints, handleSelectLevel
    ├── assets/
    │   └── main.css            # Глобальный reset (*), стили body, button
    └── components/
        ├── HeaderBar.vue       # Шапка: дата (currentDate) + кнопка "Добавить привычку"
        ├── HabitList.vue       # Список привычек: v-for HabitItem, проброс props/events
        ├── HabitItem.vue       # Карточка привычки: radio-кнопки уровней, emit selectLevel
        └── FooterBar.vue       # Подвал: totalPoints + кнопка "Сброс"
```

## Дерево компонентов и поток данных

```
App.vue
├── HeaderBar.vue
│   — Динамическая дата computed (toLocaleDateString ru-RU)
│   — Кнопка "Добавить привычку" (без обработчика)
│
├── HabitList.vue
│   Props: habits (Array), completed (Object)
│   Emits: selectLevel(habitId, levelId)
│   └── HabitItem.vue (v-for)
│       Props: habit (Object), selectedLevelId (Number|null)
│       Emits: selectLevel(habitId, levelId)
│       — При клике на уже выбранный уровень — сбрасывает (emit null)
│       — При клике на другой уровень — выбирает его
│       — Уровни отображаются числами-баллами (level вместо level.label)
│
└── FooterBar.vue
    Props: totalPoints (Number)
    Emits: reset
    — Кнопка "Сброс" сбрасывает все отметки через emit reset → App.handleReset
```

## Модель данных

### habit (объект привычки)
```ts
{
  id: number,
  name: string,
  levels: number[]  // массив баллов, индекс = идентификатор уровня
}
```

### completed (состояние выполнения)
```ts
// ref-объект, ключ — habit.id, значение — индекс уровня (number | null)
{ [habitId: number]: number | null }
```

### totalPoints (вычисляемое)
```ts
// Сумма points выбранных уровней по всем привычкам
computed: sum(habits[i].levels[completed[habits[i].id]] ?? 0)
```

## Ключевые паттерны

- **Composition API + `<script setup>`** во всех компонентах
- **Props + Emits** для передачи данных вниз и событий вверх (без provide/inject)
- **Scoped styles** во всех компонентах (кроме main.css — глобальный)
- **Radio inputs** для выбора уровня привычки (повторный клик сбрасывает выбор)
- Данные привычек пока **захардкожены** в App.vue (3 привычки: зарядка, чтение, вода)
- Кнопки "Добавить привычку", "Редактировать" — **без обработчиков** (заглушки)
- Кнопка "Сброс" в FooterBar — **реализована**: emit reset → App.vue handleReset очищает completed

## Скрипты (package.json)

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера Vite |
| `npm run build` | Production-сборка |
| `npm run preview` | Предпросмотр собранного проекта |

## Текущее состояние

Проект на ранней стадии: базовая структура готова, UI отображается, выбор уровней работает, баллы считаются.
- ✅ Динамическая дата в HeaderBar (toLocaleDateString ru-RU)
- ✅ Кнопка «Сброс» в FooterBar (emit reset → очистка completed)
- ✅ Модель данных: levels = number[] (без label, отображаются баллы)
- Не реализовано: добавление/редактирование/удаление привычек, синхронизация с Google Sheets, сохранение в localStorage.
