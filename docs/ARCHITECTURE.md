# Архітектура test-me-cypress

## Шари

```
specs
   cypress/smoke/                    смоук
   cypress/e2e/{api,ui}              регресія
   │
   ├── pages/        Page Objects    класи екранів, успадковують BasePage
   ├── support/api   API client      по методу на ендпоінт, повертає сиру відповідь
   ├── support/arrange               підготовка даних UI-тестів через API (token браузера)
   ├── data/         Test data       фікстури (require) + білдери тіл запитів
   └── support/money                 розрахунок сум у копійках, парсинг грошей з UI
```

Правило залежностей: specs → pages / api / data / money. Pages не імпортують specs, api не знає про UI.

## Патерни й чому саме вони

| Патерн | Де | Навіщо |
|--------|----|--------|
| Page Object (класи + BasePage) | `pages/*.page.js` | локатори й дії екрана в одному класі. Новий екран успадковує `BasePage` (`visit`, `reload`) і додає свої методи |
| Service Object / API client | `support/api.js` | специфікації пишуть `Api.createQuote(token, body)`, а не URL + заголовки; `failOnStatusCode: false` за замовчуванням, тож негативні кейси не потребують прапорців |
| Test Data Builder | `data/index.js` (`basket`, `checkoutBody`, `line`) | валідне тіло за замовчуванням, тест перевизначає лише поле, яке перевіряє |
| Розрахунок сум | `support/money.js` | очікувані копійки рахуються з цін і правил знижки / доставки |
| Arrange via API | `support/arrange.js` | UI-тест перевіряє лише свою поведінку; швидше й стабільніше |
| Data-driven tests | `orders.cy.js` (валідація), `workspace.cy.js` (401) | один сценарій, багато наборів даних, окремий звіт на кожен |

Глобальна custom command лише одна: `expectStatus`, бо вона потрібна як ланка ланцюжка (`Api.x().expectStatus(422)`) і падає одразу, без 10 с ретраїв. Усе інше підключається явним `require`, тож у коді працює навігація IDE, а глобального простору імен немає.

## Токени

| Шар | Як |
|-----|----|
| API | `Api.createWorkspace()` → `POST /api/workspaces` (з обробкою 429 / `Retry-After`) |
| UI | магазин створює token сам: `testIsolation` очищує `localStorage` перед кожним тестом. «Почати заново» перевіряється явно через `WorkspacePage.startFresh()` |
| UI arrange | `WorkspacePage.token()` читає token *поточного браузера* з `test-me:v2`, щоб створити дані через API. Токен ніколи не інжектиться в браузер і не логується |

## Селектори

Пріоритет: `data-testid` → `id` / `data-*`-атрибути застосунку (`data-add`, `data-compare`, `data-nav`) → роль і текст. CSS-класи для макета й позиційні селектори не використовуються.
