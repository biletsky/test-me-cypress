/**
 * Orders are seeded via API in the browser's own workspace; the UI is the system under test.
 */

const { WorkspacePage, OrdersPage, CartPage } = require('../../pages');
const { products, coupons, line } = require('../../data');
const { seedOrder, cancelOrder } = require('../../support/arrange');

describe('UI — my orders', () => {
  const { orbita, studio } = products;

  beforeEach(() => {
    WorkspacePage.open();
  });

  it('TM-ORD-001: cancel changes status to «Скасовано» and hides the cancel action', () => {
    seedOrder();
    WorkspacePage.openOrders();
    OrdersPage.status().should('have.text', 'Підтверджено');
    OrdersPage.cancel();
    WorkspacePage.toast().should('contain', 'Замовлення скасовано');
    OrdersPage.status().should('have.text', 'Скасовано');
    OrdersPage.card().contains('button', 'Скасувати замовлення').should('not.exist');
  });

  it('TM-ORD-002: filter by status and search by part of the number', () => {
    seedOrder().then((confirmed) => {
      seedOrder().then((cancelled) => {
        cancelOrder(cancelled.id);
        WorkspacePage.openOrders();
        OrdersPage.cards().should('have.length', 2);

        OrdersPage.filterStatus('confirmed');
        OrdersPage.cards().should('have.length', 1).and('contain', confirmed.id.slice(0, 8));
        OrdersPage.filterStatus('cancelled');
        OrdersPage.cards().should('have.length', 1).and('contain', cancelled.id.slice(0, 8));
        OrdersPage.filterStatus('all');
        OrdersPage.cards().should('have.length', 2);

        OrdersPage.search(confirmed.id.slice(3, 10));
        OrdersPage.cards().should('have.length', 1).and('contain', confirmed.id.slice(0, 8));
      });
    });
  });

  it('TM-ORD-003: reorder adds items to the cart without the old promo code', () => {
    seedOrder({ items: [line(orbita)], coupon: coupons.welcome10 });
    WorkspacePage.openOrders();
    OrdersPage.reorder();
    cy.get('#bag-dialog').should('have.attr', 'open');
    CartPage.quantity(orbita).should('have.text', '1');
    CartPage.expectTotals({ subtotal: 240_000, discount: 0, shipping: 0, total: 240_000 });
  });

  it('TM-ORD-004: reorder caps quantity by stock and tells the user', () => {
    seedOrder({ items: [line(studio, studio.stock)] });
    WorkspacePage.openOrders();
    OrdersPage.reorder();
    CartPage.quantity(studio).should('have.text', String(studio.stock));
    CartPage.close();

    OrdersPage.reorder();
    WorkspacePage.toast().should('contain', 'Кількість скориговано');
    CartPage.quantity(studio).should('have.text', String(studio.stock));
  });

  it('TM-ORD-005: orders survive reload', () => {
    seedOrder().then((order) => {
      WorkspacePage.open('/#orders');
      OrdersPage.cards().should('have.length', 1).first().should('contain', order.id.slice(0, 8));
    });
  });
});
