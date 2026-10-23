/**
 * Base page. Screen objects extend it and keep their own locators.
 * Add shared navigation or waits here when more than one screen needs them.
 */
class BasePage {
  visit(path = '/') {
    cy.visit(path);
    return this;
  }

  reload() {
    cy.reload();
    return this;
  }
}

module.exports = { BasePage };
