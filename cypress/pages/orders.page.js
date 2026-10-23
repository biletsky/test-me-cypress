const { BasePage } = require('./base.page');
const { parseUah } = require('../support/money');

class OrdersPage extends BasePage {
  cards() {
    return cy.get('#orders-list [data-testid="order-card"]');
  }

  card(index = 0) {
    return this.cards().eq(index);
  }

  emptyState() {
    return cy.get('#orders-list .empty-state');
  }

  status(index = 0) {
    return this.card(index).find('.status-pill');
  }

  total(index = 0) {
    return this.card(index)
      .find('header + p')
      .invoke('text')
      .then((text) => parseUah(text.split('·').pop()));
  }

  search(fragment) {
    cy.get('#order-search').clear().type(fragment, { delay: 0 });
    return this;
  }

  filterStatus(value) {
    cy.get('#order-status').select(value);
    return this;
  }

  openDetails(index = 0) {
    this.card(index).find('summary').click();
    this.card(index).find('details').should('have.attr', 'open');
    return this;
  }

  detailTotals(index = 0) {
    return this.card(index)
      .contains('details p', 'Товари:')
      .invoke('text')
      .then((text) => {
        const [subtotal, discount, shipping] = text.split('·').map(parseUah);
        return { subtotal, discount, shipping };
      });
  }

  cancel(index = 0) {
    this.card(index).contains('button', 'Скасувати замовлення').click();
    return this;
  }

  reorder(index = 0) {
    this.card(index).contains('button', 'Повторити замовлення').click();
    return this;
  }
}

module.exports = { OrdersPage };
