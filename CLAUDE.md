# Habit Tracker — контекст проекта

## Обзор

Минималистичный трекер привычек (SPA) на Vue 3 + Vite. Позволяет отслеживать выполнение ежедневных привычек с несколькими уровнями выполнения. Данные хранятся в localStorage, синхронизация с Google Sheets.

## Технологический стек

- **Vue 3.4** (Composition API, `<script setup>`)
- **Vite 5.4** (сборщик)
- **@vitejs/plugin-vue 5** (плагин Vue для Vite)
- **vue-router 4** (роутинг)
- Без Pinia — состояние в компонентах страниц

## Структура проекта

```
habits/
├── index.html                  # Точка входа: <div id="app"> + <script src="/src/main.js">
├── package.json                # Зависимости: vue 3.4, vue-router 4, vite 5.4, @vitejs/plugin-vue 5
├── vite.config.js              # Конфиг Vite: defineConfig({ plugins: [vue()] })
├── .gitignore                  # /node_modules
├── README.md                   # Описание проекта, установка, запуск
└── src/
    ├── main.js                 # createApp(App).use(router).mount('#app'), импорт main.css
    ├── App.vue                 # Корневой компонент: <router-view />
    ├── assets/
    │   └── main.css            # Глобальный reset (*), стили body, button
    ├── composables/
    │   └── useHabits.js        # Общее реактивное состояние: habits (ref), completed (reactive), CRUD-методы
    ├── routes/
    │   └── routes.js           # Конфигурация маршрутов: createRouter(createWebHistory())
    ├── pages/
    │   ├── main.vue            # Главная страница: список привычек, состояние habits/completed/totalPoints
    │   └── habit-form.vue      # Страница формы: добавление/редактирование привычки
    └── components/
        ├── HeaderBar.vue       # Шапка: дата (currentDate) + router-link «Добавить привычку» → /habit/new
        ├── HabitList.vue       # Список привычек: v-for HabitItem, проброс props/events
        ├── HabitItem.vue       # Карточка привычки: radio-кнопки уровней, router-link «Редактировать» → /habit/:id/edit
        ├── FooterBar.vue       # Подвал: totalPoints + кнопка «Сброс»
        ├── HabitForm.vue       # Форма привычки: поля название/баллы, кнопки сохранить/удалить/добавить вариант
        ├── FormField.vue       # Поле формы: label, input, отображение ошибки, v-model
        └── FormButton.vue      # Кнопка формы: варианты primary/secondary/danger, поддержка hidden
```

## Роутинг

| Путь | Имя | Страница | Описание |
|------|-----|----------|----------|
| `/` | main | main.vue | Главная — список привычек |
| `/habit/new` | habit-new | habit-form.vue | Добавление новой привычки |
| `/habit/:id/edit` | habit-edit | habit-form.vue | Редактирование привычки (props: id) |

## Дерево компонентов и поток данных

```
App.vue
└── <router-view>
    ├── main.vue (путь: /)
    │   ├── HeaderBar.vue
    │   │   — Динамическая дата computed (toLocaleDateString ru-RU)
    │   │   — router-link «Добавить привычку» → /habit/new
    │   │
    │   ├── HabitList.vue
    │   │   Props: habits (Array), completed (Object)
    │   │   Emits: selectLevel(habitId, levelId)
    │   │   └── HabitItem.vue (v-for)
    │   │       Props: habit (Object), selectedLevelId (Number|null)
    │   │       Emits: selectLevel(habitId, levelId)
    │   │       — При клике на уже выбранный уровень — сбрасывает (emit null)
    │   │       — При клике на другой уровень — выбирает его
    │   │       — Уровни отображаются числами-баллами (level вместо level.label)
    │   │       — router-link «Редактировать» → /habit/:id/edit
    │   │
    │   └── FooterBar.vue
    │       Props: totalPoints (Number)
    │       Emits: reset
    │       — Кнопка «Сброс» сбрасывает все отметки через emit reset → main.handleReset
    │
    └── habit-form.vue (пути: /habit/new, /habit/:id/edit)
        ├── HeaderBar.vue (та же шапка с датой и кнопкой «Добавить привычку»)
        └── HabitForm.vue
            Props: habitId (Number|null)
            Emits: saved({ id, name, levels }), deleted(id)
            — isEdit = habitId != null
            — Заголовок: «Новая привычка» / «Редактирование привычки»
            — При редактировании загружает данные через useHabits().getHabitById(id)
            — Валидация: название (1-128 символов), баллы (≥1, ≤128)
            ├── FormField.vue (название)
            │   Props: label, type, required, minlength, maxlength, placeholder, error
            │   v-model: modelValue
            ├── FormField.vue (баллы за выполнение, v-for levels)
            ├── FormButton.vue («Добавить вариант выполнения», variant=secondary)
            ├── FormButton.vue («Сохранить», variant=primary, type=submit)
            └── FormButton.vue («Удалить», variant=danger, v-if=isEdit)
```

### useHabits composable (src/composables/useHabits.js)

Модульный singleton — общее реактивное состояние привычек, доступное всем компонентам:
- `habits` — ref-массив объектов привычек
- `completed` — reactive-объект { [habitId]: levelIndex | undefined }
- `addHabit(name, levels)` — добавляет привычку, возвращает id
- `updateHabit(id, name, levels)` — обновляет существующую привычку
- `deleteHabit(id)` — удаляет привычку и её состояние completed
- `getHabitById(id)` — возвращает привычку по id или null
- `resetCompleted()` — очищает все отметки выполнения
- `seedInitialHabits(initialHabits)` — заполняет начальными данными (только если habits пуст)

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
- **vue-router** с createWebHistory для навигации между страницами
- **router-link** для навигационных кнопок (вместо голых button)
- **useHabits composable** — модульный singleton для общего реактивного состояния (без Pinia)
- Начальные привычки заполняются через `seedInitialHabits()` в main.vue (3 привычки: зарядка, чтение, вода)
- Кнопка «Сброс» в FooterBar — **реализована**: emit reset → main.vue handleReset → resetCompleted()
- CRUD привычек — **реализован**: добавление, редактирование, удаление через useHabits

### Компоненты формы

- **FormField.vue** — переиспользуемое поле ввода:
  - Props: `label`, `modelValue` (v-model), `type`, `placeholder`, `required`, `minlength`, `maxlength`, `min`, `max`, `error`
  - Emits: `update:modelValue`
  - Отображает label, input и span с ошибкой при наличии

- **FormButton.vue** — переиспользуемая кнопка:
  - Props: `label`, `variant` (primary/secondary/danger), `type` (button по умолчанию), `hidden`
  - Emits: `click`
  - Скрывается через `v-if="!hidden"`
  - Три цветовых варианта: зелёный (primary), серый (secondary), красный (danger)

- **HabitForm.vue** — контейнер формы привычки:
  - Props: `habitId` (Number|null) — если передан, форма в режиме редактирования
  - Emits: `saved({ id, name, levels })`, `deleted(id)`
  - Поле «Название» (FormField: text, required, 1-128 символов)
  - Секция «Баллы за выполнение» (FormField: number, required, 1-128, v-for)
  - Кнопка «Добавить вариант выполнения» (FormButton, variant=secondary) — добавляет поле балла
  - Кнопка «Сохранить» (FormButton, variant=primary, type=submit) — валидация + emit saved
  - Кнопка «Удалить» (FormButton, variant=danger, v-if=isEdit) — emit deleted
  - При редактировании загружает данные привычки через `useHabits().getHabitById(id)`

## Скрипты (package.json)

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера Vite |
| `npm run build` | Production-сборка |
| `npm run preview` | Предпросмотр собранного проекта |

## Текущее состояние

Базовая структура и CRUD реализованы. UI отображается, выбор уровней работает, баллы считаются.
- ✅ Динамическая дата в HeaderBar (toLocaleDateString ru-RU)
- ✅ Кнопка «Сброс» в FooterBar (emit reset → resetCompleted())
- ✅ Модель данных: levels = number[] (без label, отображаются баллы)
- ✅ Роутинг: vue-router с тремя маршрутами (главная, новая привычка, редактирование)
- ✅ Страницы: main.vue (главная), habit-form.vue (форма)
- ✅ Компоненты формы: HabitForm, FormField, FormButton
- ✅ Навигация: router-link в HeaderBar («Добавить привычку») и HabitItem («Редактировать»)
- ✅ Composable useHabits.js — общее реактивное состояние, модульный singleton
- ✅ Добавление привычки: форма без кнопки «Удалить», сохранение → addHabit → переход на главную
- ✅ Редактирование привычки: поля заполнены данными, кнопка «Удалить» видна, сохранение → updateHabit → переход на главную
- ✅ Удаление привычки: кнопка «Удалить» → deleteHabit → переход на главную
- ✅ Валидация формы: название (1-128 символов, обязательно), баллы (≥1, ≤128, минимум один)
- Не реализовано: синхронизация с Google Sheets, сохранение в localStorage.
