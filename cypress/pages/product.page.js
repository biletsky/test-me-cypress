const { BasePage } = require('./base.page');

class ProductPage extends BasePage {
  dialog() {
    return cy.get('#product-dialog');
  }

  title() {
    return cy.get('#detail-title');
  }

  savedReview() {
    return cy.get('#saved-review .review-card');
  }

  reviewForm() {
    return cy.get('#review-form');
  }

  reviewError() {
    return cy.get('#review-error');
  }

  submitReview({ rating, text }) {
    cy.get('#review-rating').select(String(rating));
    cy.get('#review-text').clear().type(text, { delay: 0, parseSpecialCharSequences: false });
    cy.get('#review-form button[type="submit"]').click();
    return this;
  }

  close() {
    cy.get('[data-close="product-dialog"]').click();
    return this;
  }
}

module.exports = { ProductPage };
