# test-me-cypress

UI + API автотести для [test-me.vzl.one](https://test-me.vzl.one/) на **Cypress + JavaScript**.

- План, пріоритети, ризики, результати: [docs/TEST_PLAN.md](docs/TEST_PLAN.md)
- Тест-кейси (ID збігаються з назвами автотестів): [docs/TEST_CASES.md](docs/TEST_CASES.md)
- Баг-репорти: [docs/BUGS.md](docs/BUGS.md) · [docs/BUGS.docx](docs/BUGS.docx) · [docs/BUGS.pdf](docs/BUGS.pdf)
- Архітектура й патерни: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Встановлення

```bash
npm ci
```

## Запуск

```bash
npm run cy:open        # інтерактивно, smoke і e2e разом
npm run cy:run         # headless, обидва набори
npm run cy:run:e2e     # cypress/e2e
npm run cy:run:api     # API-регресія
npm run cy:run:ui      # UI-регресія
```

## Структура

```
cypress/e2e/api/      API-регресія
cypress/e2e/ui/       UI-регресія, мобільний режим, мережа, a11y
cypress/pages/        page objects (класи, BasePage)
cypress/data/         фікстури + білдери тіл запитів
cypress/fixtures/     JSON: products, users, addresses, checkout
cypress/support/      api.js, arrange.js, money.js, commands.js
docs/                 TEST_PLAN, TEST_CASES, ARCHITECTURE
```

Не комітьте токени та скріншоти з токенами з Network / Storage.
