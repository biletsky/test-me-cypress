const { workspacePage, catalogPage, cartPage } = require('../../pages');
const { products } = require('../../data');

const noHorizontalScroll = () =>
  cy.window().then((win) => {
    const documentElement = win.document.documentElement;

    // The total content width must not exceed the visible viewport width
    expect(documentElement.scrollWidth).to.equal(documentElement.clientWidth);
  });

describe('UI — mobile 360px', () => {
  beforeEach(() => {
    cy.viewport(360, 740);
    workspacePage.open();
  });

  it('TM-MOB-001: catalog → cart works at 360px without horizontal scroll', () => {
    noHorizontalScroll();
    catalogPage.card(products.orbita).should('be.visible');
    catalogPage.addToCart(products.orbita);
    workspacePage.cartCount().should('have.text', '1');
    workspacePage.openCart();
    cartPage.lines().should('be.visible');
    cartPage.placeOrderButton().scrollIntoView().should('be.visible');
    noHorizontalScroll();
  });
});
