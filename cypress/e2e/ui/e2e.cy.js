const { workspacePage, ordersPage, cartPage, catalogPage } = require('../../pages');
const { products, coupons, customer } = require('../../data');

describe('E2E tests', () => {

    const { orbita } = products;

    beforeEach(() => {
        workspacePage.open();
    });

    it('TM-E2E-001: Positive:Successfully placed an order with valid promo code and approved payment', () => {
        catalogPage.search(orbita.name);
        catalogPage.show(orbita).addToCart(orbita);
        workspacePage.openCart();
        workspacePage.cartCount().should('have.text', 1);
        cartPage.increase(orbita, 2);
        workspacePage.cartCount().should('have.text', 3);
        cartPage.applyCoupon(coupons.welcome10);
        cartPage.selectDelivery('standard');
        cartPage.fillCustomer(customer());
        cartPage.selectPayment('approved');
        cartPage.placeOrder();
        workspacePage.toast().should('contain', 'Замовлення успішно оформлено');
        workspacePage.openOrders();
        ordersPage.status().should('have.text', 'Підтверджено');
        ordersPage.card().contains('button', 'Скасувати замовлення').should('exist');
    });

    it('TM-E2E-002: Negative:Placed order with invalid promo code and declined payment', () => {
        catalogPage.search(orbita.name);
        catalogPage.show(orbita).addToCart(orbita);
        workspacePage.openCart();
        cartPage.increase(orbita, 7);
        workspacePage.cartCount().should('have.text', 8);
        cartPage.increaseButton(orbita).should('be.disabled');
        cartPage.applyCoupon('TEST');
        cartPage.error().should('contain', '422 · Невідомий промокод');
        cartPage.reload();
        workspacePage.openCart();
        workspacePage.cartCount().should('have.text', 8);
        cartPage.couponInput().should('have.value', 'TEST');
        cartPage.selectDelivery('express');
        cartPage.fillCustomer(customer());
        cartPage.selectPayment('declined');
        cartPage.placeOrder();
        cartPage.error().should('contain', '402 · Тестовий платіж відхилено');
        workspacePage.cartCount().should('have.text', 8);
    });
});