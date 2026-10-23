const { BasePage } = require('./base.page');
const { parseUah } = require('../support/money');

const TOTAL_LABELS = {
  Товари: 'subtotal',
  Знижка: 'discount',
  Доставка: 'shipping',
  Разом: 'total',
};

const readTotals = ($totals) =>
  Object.fromEntries(
    [...$totals.find('> div')].map((row) => {
      const [label, value] = row.querySelectorAll('span');
      return [TOTAL_LABELS[label.textContent.trim()], parseUah(value.textContent)];
    })
  );

class CartPage extends BasePage {
  lines() {
    return cy.get('#bag-items .bag-line');
  }

  quantity(product) {
    return cy.get(`[data-testid="quantity-${product.id}"]`);
  }

  increaseButton(product) {
    return cy.get(`[data-quantity="${product.id}"][data-delta="1"]`);
  }

  emptyState() {
    return cy.get('#bag-items .empty-state');
  }

  error() {
    return cy.get('#checkout-error');
  }

  placeOrderButton() {
    return cy.get('[data-testid="place-order"]');
  }

  couponInput() {
    return cy.get('[data-testid="coupon"]');
  }

  increase(product, times = 1) {
    for (let i = 0; i < times; i += 1) this.increaseButton(product).first().click();
    return this;
  }

  remove(product) {
    cy.get(`[data-remove="${product.id}"]`).first().click();
    return this;
  }

  applyCoupon(code) {
    this.couponInput().clear().type(code, { delay: 0 });
    cy.get('#apply-coupon').click();
    return this;
  }

  selectDelivery(value) {
    cy.get('#delivery').select(value);
    return this;
  }

  selectPayment(value) {
    cy.get('#payment').select(value);
    return this;
  }

  fillCustomer(customer) {
    cy.get('#customer-name').clear().type(customer.name, { delay: 0 });
    cy.get('#email').clear().type(customer.email, { delay: 0 });
    cy.get('#address').clear().type(customer.address, { delay: 0 });
    return this;
  }

  placeOrder() {
    this.placeOrderButton().should('be.enabled').click();
    return this;
  }

  close() {
    cy.get('[data-close="bag-dialog"]').click();
    return this;
  }

  expectTotals(expected) {
    cy.get('#totals').should(($t) => {
      expect(readTotals($t)).to.deep.equal(expected);
    });
    return this;
  }
}

module.exports = { CartPage };
