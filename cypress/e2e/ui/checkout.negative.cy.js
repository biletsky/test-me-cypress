const { WorkspacePage, CatalogPage, CartPage, OrdersPage } = require('../../pages');
const { products, customer, coupons } = require('../../data');

describe('UI — checkout negative paths', () => {
  const { orbita } = products;

  beforeEach(() => {
    WorkspacePage.open();
    CatalogPage.addToCart(orbita);
    WorkspacePage.openCart();
    CartPage.fillCustomer(customer());
  });

  it('TM-CHECKOUT-002: declined payment shows 402, keeps the cart and creates no order', () => {
    cy.intercept('POST', '**/api/orders').as('createOrder');
    CartPage.selectPayment('declined').placeOrder();

    cy.wait('@createOrder').its('response.statusCode').should('eq', 402);
    CartPage.error().should('contain', '402');
    WorkspacePage.cartCount().should('have.text', '1');
    CartPage.lines().should('have.length', 1);

    CartPage.close();
    WorkspacePage.openOrders();
    OrdersPage.emptyState().should('contain', 'Замовлень не знайдено');
  });

  it('TM-CHECKOUT-003: double click on «Оформити замовлення» creates exactly one order', () => {
    // Slow the response so the second click lands while the first request is in flight.
    cy.intercept('POST', '**/api/orders', (req) => {
      req.on('response', (res) => res.setDelay(1500));
    }).as('createOrder');

    CartPage.expectTotals({ subtotal: 240_000, discount: 0, shipping: 0, total: 240_000 });
    CartPage.placeOrderButton().dblclick();

    cy.wait('@createOrder');
    OrdersPage.cards().should('have.length', 1);
    cy.get('@createOrder.all').should('have.length', 1);
  });

  it('TM-CHECKOUT-004: unknown promo code shows an error and blocks checkout', () => {
    CartPage.applyCoupon(coupons.unknown);
    CartPage.error().should('contain', '422');
    CartPage.placeOrderButton().should('be.disabled');
  });

  it('TM-CHECKOUT-005: invalid contact data is rejected before an order is sent', () => {
    cy.intercept('POST', '**/api/orders').as('createOrder');
    CartPage.fillCustomer({ ...customer(), email: 'not-an-email' });
    CartPage.placeOrder();
    cy.get('#email:invalid').should('exist');
    cy.get('#bag-dialog').should('have.attr', 'open');
    cy.get('@createOrder.all').should('have.length', 0);
  });
});
