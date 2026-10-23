const { WorkspacePage, CatalogPage, CartPage } = require('../../pages');
const { products } = require('../../data');

const noHorizontalScroll = () =>
  cy.document().should((doc) => {
    expect(doc.documentElement.scrollWidth, 'page width').to.be.at.most(doc.documentElement.clientWidth);
  });

describe('UI — mobile 360px', () => {
  beforeEach(() => {
    cy.viewport(360, 740);
    WorkspacePage.open();
  });

  it('TM-MOB-001: catalog → cart works at 360px without horizontal scroll', () => {
    noHorizontalScroll();
    CatalogPage.card(products.orbita).should('be.visible');
    CatalogPage.addToCart(products.orbita);
    WorkspacePage.cartCount().should('have.text', '1');
    WorkspacePage.openCart();
    CartPage.lines().should('be.visible');
    CartPage.placeOrderButton().scrollIntoView().should('be.visible');
    noHorizontalScroll();
  });
});
