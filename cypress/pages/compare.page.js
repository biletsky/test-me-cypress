const { BasePage } = require('./base.page');

class ComparePage extends BasePage {
  bar() {
    return cy.get('#compare-bar');
  }

  count() {
    return cy.get('#compare-count');
  }

  openButton() {
    return cy.get('#open-compare');
  }

  table() {
    return cy.get('#compare-content table');
  }

  open() {
    this.openButton().should('be.enabled').click();
    cy.get('#compare-dialog').should('have.attr', 'open');
    return this;
  }

  row(label) {
    return cy
      .get('#compare-content tbody tr')
      .filter((_, tr) => tr.querySelector('th').textContent.trim() === label)
      .should('have.length', 1)
      .find('td')
      .then(($td) => [...$td].map((td) => td.textContent.trim()));
  }

  clear() {
    cy.get('#clear-compare').click();
    return this;
  }
}

module.exports = { ComparePage };
