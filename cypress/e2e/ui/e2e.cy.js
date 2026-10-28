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
        ordersPage.card().contains('button', 'Повторити замовлення').should('exist');
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


    it('TM-E2E-00: Positive:Successfully placed an order with valid promo code and approved payment without page objects and fixtures', () => {
        cy.get('[data-testid=search]').type('Орбіта');
        cy.get('[data-testid=product-p01]').should('be.visible');
        cy.get('[data-testid=product-p01] .product-title').should('have.text', 'Бездротові навушники «Орбіта»');
        cy.get('[data-add="p01"]').click();
        cy.get('#cart-count').should('have.text', 1);
        cy.get('[data-testid=cart-open]').click();
        cy.get('[data-delta="1"]').click();
        cy.get('#cart-count').should('have.text', 2);
        cy.get('[data-testid=coupon]').type('WELCOME10');
        cy.get('#apply-coupon').click();
        cy.get('#customer-name').type('Тест Тестовий');
        cy.get('#email').type('test@example.com');
        cy.get('#address').type('Київ, Україна');
        cy.get('[data-testid=place-order]').click();
        cy.get('#toast').should('be.visible').and('contain', 'Замовлення успішно оформлено');
        cy.get('.status-pill').should('have.text', 'Підтверджено');
        cy.get('#orders-list [data-testid=order-card]').contains('button', 'Скасувати замовлення').should('be.visible');
        cy.get('#orders-list [data-testid=order-card]').contains('button', 'Повторити замовлення').should('be.visible');
    });
});