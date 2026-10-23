/**
 * App shell: header, navigation, toast, workspace lifecycle.
 *
 * Every Cypress test starts with empty localStorage (testIsolation), so open()
 * already yields a brand-new workspace created by the shop itself.
 * startFresh() exercises the «Почати заново» flow explicitly.
 */

const STORAGE_KEY = 'test-me:v2';

const WorkspacePage = {
  open(path = '/') {
    cy.visit(path);
    return this.waitUntilReady();
  },

  reload() {
    cy.reload();
    return this.waitUntilReady();
  },

  waitUntilReady() {
    cy.get('#workspace-status').should('contain', 'Особисте середовище');
    cy.get('[data-testid="product-grid"] .product-card').should('have.length.greaterThan', 0);
    cy.get('[data-testid="cart-open"]').should('be.enabled');
    return this;
  },

  startFresh() {
    cy.contains('button', 'Почати заново').click();
    cy.get('#reset-dialog').should('have.attr', 'open');
    cy.get('#confirm-reset').click();
    cy.get('#reset-dialog').should('not.have.attr', 'open');
    this.toast().should('contain', 'Нове середовище готове');
    return this;
  },

  /** Yields the browser's workspace token (for API arrange steps only; never log it). */
  token() {
    return cy
      .window({ log: false })
      .then((win) => JSON.parse(win.localStorage.getItem(STORAGE_KEY) || '{}').token);
  },

  storage() {
    return cy
      .window({ log: false })
      .then((win) => JSON.parse(win.localStorage.getItem(STORAGE_KEY) || '{}'));
  },

  openCart() {
    cy.get('[data-testid="cart-open"]').click();
    cy.get('#bag-dialog').should('have.attr', 'open');
    return this;
  },

  openOrders() {
    cy.get('[data-nav="orders"]').click();
    cy.get('#orders-view').should('be.visible');
    return this;
  },

  openFavorites() {
    cy.get('[data-nav="favorites"]').click();
    cy.get('#favorites-view').should('be.visible');
    return this;
  },

  cartCount: () => cy.get('#cart-count'),
  favoriteCount: () => cy.get('#favorite-count'),
  toast: () => cy.get('#toast'),
};

module.exports = { WorkspacePage };
