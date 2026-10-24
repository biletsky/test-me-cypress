/**
 * Base page. Screen objects extend it and keep their own locators.
 * Add shared navigation or waits here when more than one screen needs them.
 */
class BasePage {
  open(path = '/') {
    cy.visit(path);
    return this.waitUntilReady();
  }

  reload() {
    cy.reload();
    return this.waitUntilReady();
  }

  waitUntilReady() {
    cy.get('#workspace-status').should('contain', 'Особисте середовище');
    cy.get('[data-testid="product-grid"] .product-card').should('have.length.greaterThan', 0);
    cy.get('[data-testid="cart-open"]').should('be.enabled');
    return this;
  }
}

module.exports = { BasePage };
