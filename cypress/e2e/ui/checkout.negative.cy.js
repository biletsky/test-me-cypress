const { workspacePage, catalogPage, cartPage, ordersPage } = require('../../pages');
const { products, customer, coupons } = require('../../data');

describe('UI — checkout negative paths', () => {
  const { orbita } = products;

  beforeEach(() => {
    workspacePage.open();
    catalogPage.addToCart(orbita);
    workspacePage.openCart();
    cartPage.fillCustomer(customer());
  });

  it('TM-CHECKOUT-001: declined payment shows 402, keeps the cart and creates no order', () => {
    cartPage.selectPayment('declined').placeOrder();
    cartPage.error().should('contain', '402 · Тестовий платіж відхилено');
    workspacePage.cartCount().should('have.text', '1');
    cartPage.lines().should('have.length', 1);
    cartPage.close();
    workspacePage.openOrders();
    ordersPage.emptyState().should('contain', 'Замовлень не знайдено');
  });

  it('TM-CHECKOUT-002: double click on «Оформити замовлення» creates exactly one order', () => {
    // Slow the response so the second click lands while the first request is in flight.
    cy.intercept('POST', '**/api/orders', (req) => {
      req.on('response', (res) => res.setDelay(1500));
    }).as('createOrder');

    cartPage.expectTotals({ subtotal: 240_000, discount: 0, shipping: 0, total: 240_000 });
    cartPage.placeOrderButton().dblclick();

    cy.wait('@createOrder');
    ordersPage.cards().should('have.length', 1);
    cy.get('@createOrder.all').should('have.length', 1);
  });

  it('TM-CHECKOUT-003: unknown promo code shows an error and blocks checkout', () => {
    cartPage.applyCoupon(coupons.unknown);
    cartPage.error().should('contain', '422');
    cartPage.placeOrderButton().should('be.disabled');
  })

  it('TM-CHECKOUT-004: invalid contact data is rejected before an order is sent', () => {
    cy.intercept('POST', '**/api/orders').as('createOrder');
    cartPage.fillCustomer({ ...customer(), email: 'not-an-email' });
    cartPage.placeOrder();
    cy.get('#email:invalid').should('exist');
    cy.get('#bag-dialog').should('have.attr', 'open');
    cy.get('@createOrder.all').should('have.length', 0);
  });

  it('TM-NET-005 429 on order creation is surfaced and the cart is kept', () => {
    cy.intercept('POST', '**/api/orders', {
      statusCode: 429,
      headers: { 'Retry-After': '10' },
      body: { detail: 'Забагато запитів' },
    });
    cartPage.placeOrder();
    cartPage.error().should('contain', '429');
    workspacePage.cartCount().should('have.text', '1');
  });

});
