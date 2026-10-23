const { BasePage } = require('./base.page');
const { parseUah } = require('../support/money');

const GRID = '[data-testid="product-grid"]';

class CatalogPage extends BasePage {
  cards() {
    return cy.get(`${GRID} .product-card`);
  }

  card(product) {
    return cy.get(`${GRID} [data-testid="product-${product.id}"]`);
  }

  status() {
    return cy.get('#catalog-status');
  }

  pageInfo() {
    return cy.get('#page-info');
  }

  searchInput() {
    return cy.get('[data-testid="search"]');
  }

  sortSelect() {
    return cy.get('[data-testid="sort"]');
  }

  show(product) {
    this.selectCategory(product.category);
    this.card(product).should('be.visible');
    return this;
  }

  addToCart(product, times = 1) {
    for (let i = 0; i < times; i += 1) {
      this.card(product).find(`[data-add="${product.id}"]`).click();
    }
    return this;
  }

  addToCartButton(product) {
    return cy.get(`${GRID} [data-add="${product.id}"]`);
  }

  toggleCompare(product) {
    this.card(product).find(`[data-compare="${product.id}"]`).click();
    return this;
  }

  toggleFavorite(product) {
    this.card(product).find(`[data-favorite="${product.id}"]`).click();
    return this;
  }

  openDetails(product) {
    this.card(product).find('.product-title').click();
    cy.get('#product-dialog').should('have.attr', 'open');
    return this;
  }

  search(query) {
    this.searchInput().clear().type(query, { delay: 0 });
    return this;
  }

  selectCategory(category) {
    cy.get(`[data-category="${category}"]`).click().should('have.class', 'selected');
    return this;
  }

  sort(value) {
    this.sortSelect().select(value);
    return this;
  }

  onlyInStock(checked = true) {
    const box = cy.get('#in-stock');
    if (checked) box.check();
    else box.uncheck();
    return this;
  }

  setPriceRange(minUah, maxUah) {
    if (minUah != null) cy.get('#min-price').clear().type(String(minUah));
    if (maxUah != null) cy.get('#max-price').clear().type(String(maxUah));
    cy.get('#price-filters button[type="submit"]').click();
    return this;
  }

  resetFilters() {
    cy.get('#clear-filters').click();
    return this;
  }

  nextPage() {
    cy.get('#next').click();
    return this;
  }

  expectTotalFound(total) {
    this.status().should('have.text', `Знайдено товарів: ${total}`);
    return this;
  }

  prices() {
    return cy.get(`${GRID} .product-card .price`).then(($p) => [...$p].map((el) => parseUah(el.textContent)));
  }
}

module.exports = { CatalogPage };
