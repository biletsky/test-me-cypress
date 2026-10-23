const { WorkspacePage, CatalogPage, CartPage } = require('../../pages');
const { products, coupons } = require('../../data');

describe('UI — cart', () => {
  beforeEach(() => {
    WorkspacePage.open();
  });

  it('TM-CART-001: adding the same product twice keeps one line per product_id', () => {
    const { focus } = products;
    CatalogPage.show(focus).addToCart(focus, 2);
    WorkspacePage.cartCount().should('have.text', '2');
    WorkspacePage.openCart();
    CartPage.lines().should('have.length', 1);
    CartPage.quantity(focus).should('have.text', '2');
  });

  it('TM-CART-002: quantity is capped by stock', () => {
    const { studio } = products;
    CatalogPage.show(studio).addToCart(studio, studio.stock);
    WorkspacePage.cartCount().should('have.text', String(studio.stock));
    CatalogPage.addToCart(studio);
    WorkspacePage.toast().should('contain', 'Досягнуто максимальної доступної кількості');
    WorkspacePage.cartCount().should('have.text', String(studio.stock));
    WorkspacePage.openCart();
    CartPage.increaseButton(studio).should('be.disabled');
  });

  it('TM-CART-003: quantity is capped at 10 even when stock is larger', () => {
    const { idea } = products;
    expect(idea.stock).to.be.greaterThan(10);
    CatalogPage.show(idea).addToCart(idea);
    WorkspacePage.openCart();
    CartPage.increase(idea, 9);
    CartPage.quantity(idea).should('have.text', '10');
    CartPage.increaseButton(idea).should('be.disabled');
  });

  it('TM-CART-004: out-of-stock product cannot be added', () => {
    const { outOfStock } = products;
    CatalogPage.show(outOfStock);
    CatalogPage.addToCartButton(outOfStock).should('be.disabled').and('have.text', 'Очікуємо');
  });

  it('TM-CART-005: removing the last item shows the empty cart', () => {
    const { orbita } = products;
    CatalogPage.addToCart(orbita);
    WorkspacePage.openCart();
    CartPage.remove(orbita);
    CartPage.emptyState().should('contain', 'Ваш кошик порожній');
    WorkspacePage.cartCount().should('have.text', '0');
    cy.get('#checkout-form').should('not.be.visible');
  });

  it('TM-CART-006: cart survives reload', () => {
    const { orbita } = products;
    CatalogPage.addToCart(orbita, 2);
    WorkspacePage.reload();
    WorkspacePage.cartCount().should('have.text', '2');
    WorkspacePage.openCart();
    CartPage.quantity(orbita).should('have.text', '2');
  });

  it('TM-CART-007: applied promo code survives reload', () => {
    const { orbita } = products;
    const withPromo = { subtotal: 240_000, discount: 24_000, shipping: 0, total: 216_000 };
    CatalogPage.addToCart(orbita);
    WorkspacePage.openCart();
    CartPage.applyCoupon(coupons.welcome10).expectTotals(withPromo);

    WorkspacePage.reload();
    WorkspacePage.openCart();
    CartPage.expectTotals(withPromo);
  });

  it('TM-CART-008: UI shows hryvnias for the kopiyka amounts returned by the API', () => {
    const { duha } = products;
    cy.intercept('POST', '**/api/quote').as('quote');
    CatalogPage.show(duha).addToCart(duha);
    WorkspacePage.openCart();
    cy.wait('@quote').its('response.body').then((q) => {
      CartPage.expectTotals({ subtotal: q.subtotal, discount: q.discount, shipping: q.shipping, total: q.total });
      // Currency sign depends on the browser's ICU data: «₴» or «грн».
      cy.get('[data-testid="cart-total"] span')
        .last()
        .invoke('text')
        .should('match', /^1\s?079,00\s?(₴|грн)$/);
    });
  });
});
