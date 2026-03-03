# GitHub Search – FullstackJS Technical Test

## 🚀 Stack

- React + TypeScript
- Vite
- Vitest + Testing Library
- ESLint (strict rules enabled)

---

## ▶️ Run the project

```bash
npm install
npm run dev

Application will be available at:

http://localhost:5173
🧪 Run tests
npm test

Tests cover:

Empty results handling

Select All behavior

Delete selected items

✨ Features

Live search (no submit button / no Enter key)

Debounced input (350ms)

AbortController to cancel stale requests

Responsive UI based on provided mock

Per-card selection

Select All with indeterminate state

Selected items counter

Front-only actions:

Duplicate

Delete

Bonus: Edit mode (hide selection & actions)

⚙️ Technical Decisions
useReducer for UI State

Centralized and predictable state transitions.
Avoids cascading setState inside effects.

Debounce + AbortController

Debounce reduces unnecessary API calls.

AbortController prevents race conditions and stale UI updates.

Selection using Set

Set allows O(1) lookup and clean toggle logic.

Unique UI ID

Each rendered user gets a uiId to prevent React key collisions when duplicating items.

Avatar Fallback Handling

Broken or invalid avatar URLs gracefully display a fallback label inside the avatar circle.

🧩 Edge Cases Handled

No results found

GitHub API rate limit (friendly message displayed)

Fast typing / back-and-forth input

Reset UI actions when search changes

🔮 Possible Improvements

Result caching per query

Pagination / infinite scroll

Accessibility improvements (keyboard navigation)

Skeleton loading state

Memoization optimizations for large lists

📌 Notes

This implementation focuses on:

Clean architecture

Predictable state management

Performance safety

Code readability

Compliance with the provided mock