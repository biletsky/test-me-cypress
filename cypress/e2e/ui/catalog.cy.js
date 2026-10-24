const { workspacePage, catalogPage } = require('../../pages');
const { products } = require('../../data');
const { parseUah } = require('../../support/money');

describe('UI — catalog & filters', () => {
  beforeEach(() => {
    workspacePage.open();
  });

  it('TM-CAT-001: catalog shows 6 products per page and paginates', () => {
    catalogPage.cards().should('have.length', 6);
    catalogPage.pageInfo().should('have.text', '1 / 3');
    catalogPage.nextPage();
    catalogPage.pageInfo().should('have.text', '2 / 3');
    catalogPage.cards().should('have.length', 6);
  });

  it('TM-CAT-002: changing a filter returns to page 1', () => {
    catalogPage.nextPage();
    catalogPage.pageInfo().should('have.text', '2 / 3');
    catalogPage.onlyInStock();
    catalogPage.pageInfo().invoke('text').should('match', /^1 \//);
  });

  it('TM-CAT-003: reset clears every filter', () => {
    catalogPage.selectCategory('Audio').sort('price_desc').onlyInStock().setPriceRange(1000, 3000);
    catalogPage.resetFilters();

    cy.get('[data-category=""]').should('have.class', 'selected');
    cy.get('[data-testid="search"]').should('have.value', '');
    cy.get('[data-testid="sort"]').should('have.value', 'featured');
    cy.get('#in-stock').should('not.be.checked');
    cy.get('#min-price').should('have.value', '');
    cy.get('#max-price').should('have.value', '');
    catalogPage.pageInfo().should('have.text', '1 / 3');
  });

  it('TM-CAT-004: search ignores case and outer spaces', () => {
    ['Орбіта', 'орбіта', '  ОРБІТА  '].forEach((query) => {
      catalogPage.search(query);
      catalogPage.expectTotalFound(1);
      catalogPage.card(products.orbita).should('be.visible');
    });
  });

  it('TM-CAT-005: «Лише в наявності» hides stock=0 products', () => {
    const { outOfStock } = products;
    catalogPage.show(outOfStock);
    catalogPage.onlyInStock();
    catalogPage.card(outOfStock).should('not.exist');
    catalogPage.cards().should('have.length.greaterThan', 0);
  });

  it('TM-CAT-006: min price above max price is reported, not silently ignored', () => {
    catalogPage.setPriceRange(2000, 1000);
    catalogPage.status().should('contain', 'Мінімальна ціна перевищує максимальну');
  });

  it('TM-CAT-007: price sorting is numeric', () => {
    catalogPage.sort('price_asc');
    catalogPage.cards().first().should('have.attr', 'data-testid', `product-${products.idea.id}`);
    catalogPage.prices().then((p) => expect(p).to.deep.eq([...p].sort((a, b) => a - b)));
    catalogPage.sort('price_desc');
    catalogPage.cards().first().should('have.attr', 'data-testid', `product-${products.studio.id}`);
    catalogPage.prices().then((p) => expect(p).to.deep.eq([...p].sort((a, b) => b - a)));
  });

  it('TM-CAT-008: product card opens image, description, price, stock and specs', () => {
    const { orbita } = products;
    catalogPage.openDetails(orbita);
    cy.get('#product-detail').within(() => {
      cy.get('img.detail-photo').should('have.attr', 'src').and('not.be.empty');
      cy.get('#detail-title').should('have.text', orbita.name);
      cy.get('p').first().invoke('text').should('have.length.greaterThan', 10);
      cy.get('.detail-price').invoke('text').then(parseUah).should('eq', orbita.price);
      cy.contains(`У наявності: ${orbita.stock} шт.`);
      cy.get('dl > div').should('have.length.greaterThan', 0);
    });
  });

  it('TM-CAT-009: catalog shows a readable message when the network is down', () => {
    cy.intercept('GET', '**/api/products?*', { forceNetworkError: true });
    catalogPage.search('лампа');
    catalogPage.status().should('contain', 'Немає зв’язку із сервером');
  });
});
