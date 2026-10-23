const { WorkspacePage, CatalogPage } = require('../../pages');
const { products } = require('../../data');
const { parseUah } = require('../../support/money');

describe('UI — catalog & filters', () => {
  beforeEach(() => {
    WorkspacePage.open();
  });

  it('TM-CAT-001: catalog shows 6 products per page and paginates', () => {
    CatalogPage.cards().should('have.length', 6);
    CatalogPage.pageInfo().should('have.text', '1 / 3');
    CatalogPage.nextPage();
    CatalogPage.pageInfo().should('have.text', '2 / 3');
    CatalogPage.cards().should('have.length', 6);
    CatalogPage.card(products.orbita).should('not.exist');
  });

  it('TM-CAT-002: changing a filter returns to page 1', () => {
    CatalogPage.nextPage();
    CatalogPage.pageInfo().should('have.text', '2 / 3');
    CatalogPage.onlyInStock();
    CatalogPage.pageInfo().invoke('text').should('match', /^1 \//);
  });

  it('TM-CAT-003: reset clears every filter', () => {
    CatalogPage.selectCategory('Audio').sort('price_desc').onlyInStock().setPriceRange(1000, 3000);
    CatalogPage.expectTotalFound(3);
    CatalogPage.resetFilters();

    cy.get('[data-category=""]').should('have.class', 'selected');
    cy.get('[data-testid="search"]').should('have.value', '');
    cy.get('[data-testid="sort"]').should('have.value', 'featured');
    cy.get('#in-stock').should('not.be.checked');
    cy.get('#min-price').should('have.value', '');
    cy.get('#max-price').should('have.value', '');
    CatalogPage.expectTotalFound(16);
    CatalogPage.pageInfo().should('have.text', '1 / 3');
  });

  it('TM-CAT-004: search ignores case and outer spaces', () => {
    ['Орбіта', 'орбіта', '  ОРБІТА  '].forEach((query) => {
      CatalogPage.search(query);
      CatalogPage.expectTotalFound(1);
      CatalogPage.card(products.orbita).should('be.visible');
    });
  });

  it('TM-CAT-005: «Лише в наявності» hides stock=0 products', () => {
    const { outOfStock } = products;
    CatalogPage.show(outOfStock);
    CatalogPage.onlyInStock();
    CatalogPage.card(outOfStock).should('not.exist');
    CatalogPage.cards().should('have.length.greaterThan', 0);
  });

  it('TM-CAT-006: price range in UAH is inclusive on both ends', () => {
    CatalogPage.setPriceRange(1500, 1500);
    CatalogPage.expectTotalFound(1);
    CatalogPage.card(products.khvylia).should('be.visible');
  });

  it('TM-CAT-007: min price above max price is reported, not silently ignored', () => {
    CatalogPage.setPriceRange(2000, 1000);
    CatalogPage.status().should('contain', 'Мінімальна ціна перевищує максимальну');
  });

  it('TM-CAT-008: price sorting is numeric', () => {
    CatalogPage.sort('price_asc');
    CatalogPage.cards().first().should('have.attr', 'data-testid', `product-${products.idea.id}`);
    CatalogPage.prices().then((p) => expect(p).to.deep.eq([...p].sort((a, b) => a - b)));
    CatalogPage.sort('price_desc');
    CatalogPage.cards().first().should('have.attr', 'data-testid', `product-${products.studio.id}`);
    CatalogPage.prices().then((p) => expect(p).to.deep.eq([...p].sort((a, b) => b - a)));
  });

  it('TM-CAT-009: product card opens image, description, price, stock and specs', () => {
    const { orbita } = products;
    CatalogPage.openDetails(orbita);
    cy.get('#product-detail').within(() => {
      cy.get('img.detail-photo').should('have.attr', 'src').and('not.be.empty');
      cy.get('#detail-title').should('have.text', orbita.name);
      cy.get('p').first().invoke('text').should('have.length.greaterThan', 10);
      cy.get('.detail-price').invoke('text').then(parseUah).should('eq', orbita.price);
      cy.contains(`У наявності: ${orbita.stock} шт.`);
      cy.get('dl > div').should('have.length.greaterThan', 0);
    });
  });
});
