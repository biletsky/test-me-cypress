# test-me-cypress

UI + API автотести для [test-me.vzl.one](https://test-me.vzl.one/) на **Cypress + JavaScript**.

## Встановлення

```bash
npm ci
```

## Запуск

```bash
npm run cy:open        # інтерактивно, ui + api тести
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
```

Не комітьте токени та скріншоти з токенами з Network / Storage.
