# План изменений — Множественные целевые баллы + Новая структура привычек

## Блок 1 — Множественные уровни целевых баллов

### 1.1 Изменить `src/composables/useSettings.js`

- Заменить `targetPoints = ref(30)` на `targetPoints = ref([30])` (массив чисел)
- `loadFromLocalStorage()`: парсить JSON из `habits-settings-targetPoints`. Если лежит число (старый формат) — обернуть в массив `[число]`
- `saveSettings(hour, pointsArray)`: валидировать каждый элемент массива (целое, 1–256), сохранять `JSON.stringify(pointsArray)`
- Экспортировать `targetPoints` как ref-массив

### 1.2 Изменить `src/pages/settings.vue`

- Заменить одно поле `targetPointsInput` на `targetPointsInputs = ref([...targetPoints.value])`
- Выводить поля через `v-for="(point, index) in targetPointsInputs"`, каждое с `v-model="targetPointsInputs[index]"`
- Добавить кнопку «Добавить целевое кол-во баллов» (FormButton, variant=secondary), по клику — `targetPointsInputs.push(0)`
- Валидация: проверить каждый элемент (целое, 1–256)
- `handleSave()`: передавать массив в `saveSettings(dayStartHourInput.value, targetPointsInputs.value)`

### 1.3 Изменить `src/components/FooterBar.vue`

- Prop `targetPoints` теперь массив чисел (по умолчанию `[30]`)
- Формат вывода:
  - Если 1 элемент: `{totalPoints}/{targetPoints[0]} баллов`
  - Если >1: `{totalPoints}/{targetPoints[0]}({targetPoints[1]}/{targetPoints[2]}/.../{targetPoints[n]}) баллов`

### 1.4 Обновить `src/pages/main.vue`

- `targetPoints` теперь массив — передаётся в FooterBar как есть (FooterBar сам разберётся с форматом)

---

## Блок 2 — Новая структура данных привычки

### 2.1 Изменить `src/composables/useHabits.js`

**Новая модель привычки:**
```ts
{
  id: string,        // UUID v4 (crypto.randomUUID())
  name: string,
  levels: number[],
  order: number      // порядковый номер
}
```

**Изменения:**
- Убрать `nextId`, добавить `nextOrder = ref(1)`
- Новый ключ localStorage: `habits-tracker-nextOrder`
- `addHabit(name, levels, order)`: id = `crypto.randomUUID()`, order = переданный или `nextOrder++`
- `updateHabit(id, name, levels, order)`: обновлять все поля включая order
- `getNextOrder()`: вернуть `nextOrder.value`
- `updateOrder(id, newOrder)`: обновить order у привычки
- `loadFromLocalStorage()`: миграция старых привычек — если нет поля `order`, присвоить `order = id` (старый числовой id)
- `saveToLocalStorage()`: сохранять `nextOrder`

### 2.2 Изменить `src/components/HabitForm.vue`

- Добавить `order = ref(0)` 
- При создании (`!isEdit`): `order.value = useHabits().getNextOrder()`
- При редактировании: `order.value = habit.order`
- Добавить `FormField` для order: label «Порядковый номер», type=number, min=1
- Валидация: целое ≥1
- `handleSave()`: включить `order: Number(order.value)` в emit `saved`

### 2.3 Обновить `src/pages/habit-form.vue`

- `handleSaved({ id, name, levels, order })`:
  - Если `id != null`: `updateHabit(id, name, levels, order)`
  - Иначе: `addHabit(name, levels, order)`

### 2.4 Добавить сортировку в `src/pages/main.vue`

- Добавить `computed`:
  ```js
  const sortedHabits = computed(() => 
    [...habits.value].sort((a, b) => a.order - b.order)
  )
  ```
- Передавать `sortedHabits` в `HabitList` вместо `habits`

---

## Блок 3 — Обновление документации

### 3.1 Обновить `CLAUDE.md`

- Модель данных: `id: string (UUID)`, добавить `order: number`
- `useSettings`: `targetPoints: number[]`
- `useHabits`: UUID, `nextOrder`, `getNextOrder()`, `updateOrder()`
- `settings.vue`: динамические поля целевых баллов
- `FooterBar.vue`: новый формат вывода
- `HabitForm.vue`: поле order
- `main.vue`: `sortedHabits` computed
- Обновить список ключей localStorage
