/** Network failures are stubbed. Accessibility checks cover labels and button names. */

const { WorkspacePage, CatalogPage, CartPage } = require('../../pages');
const { products } = require('../../data');

describe('UI — network errors', () => {
  beforeEach(() => {
    WorkspacePage.open();
  });

  it('TM-NET-001: catalog shows a readable message when the network is down', () => {
    cy.intercept('GET', '**/api/products?*', { forceNetworkError: true });
    CatalogPage.search('лампа');
    CatalogPage.status().should('contain', 'Немає зв’язку із сервером');
  });

  it('TM-NET-002: failed quote shows an error and blocks checkout', () => {
    cy.intercept('POST', '**/api/quote', { statusCode: 500, body: { detail: 'Server error' } });
    CatalogPage.addToCart(products.orbita);
    WorkspacePage.openCart();
    CartPage.error().should('contain', '500');
    CartPage.placeOrderButton().should('be.disabled');
  });

  it('TM-NET-003: 429 on order creation is surfaced and the cart is kept', () => {
    cy.intercept('POST', '**/api/orders', {
      statusCode: 429,
      headers: { 'Retry-After': '10' },
      body: { detail: 'Забагато запитів' },
    });
    CatalogPage.addToCart(products.orbita);
    WorkspacePage.openCart();
    CartPage.fillCustomer({ name: 'Олександр Тестовий', email: 'test@example.test', address: 'Київ, вул. Тестова, 12' });
    CartPage.placeOrder();
    CartPage.error().should('contain', '429');
    WorkspacePage.cartCount().should('have.text', '1');
  });
});

describe('UI — accessibility basics', () => {
  beforeEach(() => {
    WorkspacePage.open();
  });

  it('TM-A11Y-001: every checkout field has an associated label', () => {
    CatalogPage.addToCart(products.orbita);
    WorkspacePage.openCart();
    cy.get('#checkout-form').find('input, select').each(($field) => {
      const id = $field.attr('id');
      expect(id, 'field id').to.be.a('string');
      cy.get(`label[for="${id}"]`).should('have.length', 1).invoke('text').should('not.be.empty');
    });
  });

  it('TM-A11Y-002: interactive controls have accessible names', () => {
    cy.get('button:visible').each(($b) => {
      const name = ($b.attr('aria-label') || $b.text()).trim();
      expect(name, $b.prop('outerHTML').slice(0, 80)).not.to.be.empty;
    });
  });
});
