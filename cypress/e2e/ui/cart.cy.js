const { workspacePage, catalogPage, cartPage } = require('../../pages');
const { products, coupons } = require('../../data');

describe('UI — cart', () => {
  beforeEach(() => {
    workspacePage.open();
  });

  it('TM-CART-001: adding the same product twice keeps one line per product_id', () => {
    const { focus } = products;
    catalogPage.show(focus).addToCart(focus, 2);
    workspacePage.cartCount().should('have.text', '2');
    workspacePage.openCart();
    cartPage.lines().should('have.length', 1);
    cartPage.quantity(focus).should('have.text', '2');
  });

  it('TM-CART-002: quantity is capped by stock', () => {
    const { studio } = products;
    catalogPage.show(studio).addToCart(studio, studio.stock);
    workspacePage.cartCount().should('have.text', String(studio.stock));
    catalogPage.addToCart(studio);
    workspacePage.toast().should('contain', 'Досягнуто максимальної доступної кількості');
    workspacePage.cartCount().should('have.text', String(studio.stock));
    workspacePage.openCart();
    cartPage.increaseButton(studio).should('be.disabled');
  });

  it('TM-CART-003: quantity is capped at 10 even when stock is larger', () => {
    const { idea } = products;
    expect(idea.stock).to.be.greaterThan(10);
    catalogPage.show(idea).addToCart(idea);
    workspacePage.openCart();
    cartPage.increase(idea, 9);
    cartPage.quantity(idea).should('have.text', '10');
    cartPage.increaseButton(idea).should('be.disabled');
  });

  it('TM-CART-004: out-of-stock product cannot be added', () => {
    const { outOfStock } = products;
    catalogPage.show(outOfStock);
    catalogPage.addToCartButton(outOfStock).should('be.disabled').and('have.text', 'Очікуємо');
  });

  it('TM-CART-005: removing the last item shows the empty cart', () => {
    const { orbita } = products;
    catalogPage.addToCart(orbita);
    workspacePage.openCart();
    cartPage.remove(orbita);
    cartPage.emptyState().should('contain', 'Ваш кошик порожній');
    workspacePage.cartCount().should('have.text', '0');
    cartPage.checkoutForm().should('not.be.visible');
  });

  it('TM-CART-006: cart survives reload', () => {
    const { orbita } = products;
    catalogPage.addToCart(orbita, 2);
    workspacePage.reload();
    workspacePage.cartCount().should('have.text', '2');
    workspacePage.openCart();
    cartPage.quantity(orbita).should('have.text', '2');
  });

  it('TM-CART-007: applied promo code survives reload', () => {
    const { orbita } = products;
    const withPromo = { subtotal: 240_000, discount: 24_000, shipping: 0, total: 216_000 };
    catalogPage.addToCart(orbita);
    workspacePage.openCart();
    cartPage.applyCoupon(coupons.welcome10).expectTotals(withPromo);

    workspacePage.reload();
    workspacePage.openCart();
    cartPage.expectTotals(withPromo);
  });

  it('TM-CART-008: UI shows hryvnias for the cents amounts returned by the API', () => {
    const { duha } = products;
    cy.intercept('POST', '**/api/quote').as('quote');
    catalogPage.show(duha).addToCart(duha);
    workspacePage.openCart();
    cy.wait('@quote').its('response.body').then((q) => {
      cartPage.expectTotals({ subtotal: q.subtotal, discount: q.discount, shipping: q.shipping, total: q.total });
      cy.get('[data-testid="cart-total"] span')
        .last()
        .invoke('text')
        .should('match', /^1\s?079,00\s?(грн)$/);
    });
  });

  it('TM-NET-009: failed quote shows an error and blocks checkout', () => {
    cy.intercept('POST', '**/api/quote', { statusCode: 500, body: { detail: 'Server error' } });
    catalogPage.addToCart(products.orbita);
    workspacePage.openCart();
    cartPage.error().should('contain', '500');
    cartPage.placeOrderButton().should('be.disabled');
  });
});
