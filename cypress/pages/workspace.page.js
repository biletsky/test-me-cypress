/**
 * App shell: header, navigation, toast, workspace lifecycle.
 *
 * Every Cypress test starts with empty localStorage (testIsolation), so open()
 * already yields a brand-new workspace created by the shop itself.
 * startFresh() exercises the «Почати заново» flow explicitly.
 */

const { BasePage } = require('./base.page');
const STORAGE_KEY = 'test-me:v2';

class WorkspacePage extends BasePage {

  startFresh() {
    cy.contains('button', 'Почати заново').click();
    cy.get('#reset-dialog').should('have.attr', 'open');
    cy.get('#confirm-reset').click();
    cy.get('#reset-dialog').should('not.have.attr', 'open');
    this.toast().should('contain', 'Нове середовище готове');
    return this;
  }

  /** Yields the browser's workspace token (for API arrange steps only; never log it). */
  token() {
    return cy
      .window({ log: false })
      .then((win) => JSON.parse(win.localStorage.getItem(STORAGE_KEY) || '{}').token);
  }

  storage() {
    return cy
      .window({ log: false })
      .then((win) => JSON.parse(win.localStorage.getItem(STORAGE_KEY) || '{}'));
  }

  openCart() {
    cy.get('[data-testid="cart-open"]').click();
    cy.get('#bag-dialog').should('have.attr', 'open');
    return this;
  }

  openOrders() {
    cy.get('[data-nav="orders"]').click();
    cy.get('#orders-view').should('be.visible');
    return this;
  }

  openFavorites() {
    cy.get('[data-nav="favorites"]').click();
    cy.get('#favorites-view').should('be.visible');
    return this;
  }

  cartCount() {
    return cy.get('#cart-count');
  }

  favoriteCount() {
    return cy.get('#favorite-count');
  }

  toast() {
    return cy.get('#toast');
  }
};

module.exports = { WorkspacePage };
