/**
 * Orders are seeded via API in the browser's own workspace; the UI is the system under test.
 */

const { workspacePage, ordersPage, cartPage } = require('../../pages');
const { products, coupons, line } = require('../../data');
const { seedOrder, cancelOrder } = require('../../support/arrange');

describe('UI — my orders', () => {
  const { orbita, studio } = products;

  beforeEach(() => {
    workspacePage.open();
  });

  it('TM-ORD-001: cancel changes status to «Скасовано» and hides the cancel action', () => {
    seedOrder();
    workspacePage.openOrders();
    ordersPage.status().should('have.text', 'Підтверджено');
    ordersPage.cancel();
    workspacePage.toast().should('contain', 'Замовлення скасовано');
    ordersPage.status().should('have.text', 'Скасовано');
    ordersPage.card().contains('button', 'Скасувати замовлення').should('not.exist');
  });

  it('TM-ORD-002: filter by status and search by part of the number', () => {
    seedOrder().then((confirmed) => {
      seedOrder().then((cancelled) => {
        cancelOrder(cancelled.id);
        workspacePage.openOrders();
        ordersPage.cards().should('have.length', 2);
        ordersPage.filterStatus('confirmed');
        ordersPage.cards().should('have.length', 1).and('contain', confirmed.id.slice(0, 8));
        ordersPage.filterStatus('cancelled');
        ordersPage.cards().should('have.length', 1).and('contain', cancelled.id.slice(0, 8));
        ordersPage.filterStatus('all');
        ordersPage.cards().should('have.length', 2);
        ordersPage.search(confirmed.id.slice(3, 10));
        ordersPage.cards().should('have.length', 1).and('contain', confirmed.id.slice(0, 8));
      });
    });
  });

  it('TM-ORD-003: reorder adds items to the cart without the old promo code', () => {
    seedOrder({ items: [line(orbita)], coupon: coupons.welcome10 });
    workspacePage.openOrders();
    ordersPage.reorder();
    cy.get('#bag-dialog').should('have.attr', 'open');
    cartPage.quantity(orbita).should('have.text', '1');
    cartPage.expectTotals({ subtotal: 240_000, discount: 0, shipping: 0, total: 240_000 });
  });

  it('TM-ORD-004: reorder caps quantity by stock and tells the user', () => {
    seedOrder({ items: [line(studio, studio.stock)] });
    workspacePage.openOrders();
    ordersPage.reorder();
    cartPage.quantity(studio).should('have.text', String(studio.stock));
    cartPage.close();

    ordersPage.reorder();
    workspacePage.toast().should('contain', 'Кількість скориговано');
    cartPage.quantity(studio).should('have.text', String(studio.stock));
  });

  it('TM-ORD-005: orders survive reload', () => {
    seedOrder().then((order) => {
      workspacePage.open('/#orders');
      ordersPage.cards().should('have.length', 1).first().should('contain', order.id.slice(0, 8));
    });
  });
});
