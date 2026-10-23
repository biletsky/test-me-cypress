const { WorkspacePage, CatalogPage, ProductPage } = require('../../pages');
const { products } = require('../../data');

describe('UI — reviews & favorites', () => {
  const { orbita, khvylia } = products;

  beforeEach(() => {
    WorkspacePage.open();
  });

  it('TM-REV-001: review HTML is rendered as text and never executed; survives reload', () => {
    const payload = '<img src=x onerror="window.__xss=1"> Чудовий звук';
    const alert = cy.stub().as('alert');
    cy.on('window:alert', alert);

    CatalogPage.openDetails(orbita);
    ProductPage.submitReview({ rating: 4, text: payload });
    WorkspacePage.toast().should('contain', 'Дякуємо за відгук');
    ProductPage.savedReview().find('p').should('have.text', payload);
    ProductPage.savedReview().find('img').should('not.exist');
    ProductPage.reviewForm().should('have.attr', 'hidden');

    WorkspacePage.reload();
    CatalogPage.openDetails(orbita);
    ProductPage.savedReview().should('contain', '★★★★').find('p').should('have.text', payload);
    cy.window().its('__xss').should('be.undefined');
    cy.get('@alert').should('not.have.been.called');
  });

  it('TM-REV-002: a fresh workspace has no review from the previous one', () => {
    CatalogPage.openDetails(orbita);
    ProductPage.submitReview({ rating: 5, text: 'Перший відгук, усе добре' });
    ProductPage.savedReview().should('exist');
    ProductPage.close();

    WorkspacePage.startFresh();
    CatalogPage.openDetails(orbita);
    // Cypress visibility heuristics misjudge content of a top-layer <dialog>; check the state directly.
    ProductPage.reviewForm().should('not.have.attr', 'hidden');
    ProductPage.savedReview().should('not.exist');
  });

  it('TM-FAV-001: favorite persists on the server after reload; second click removes it', () => {
    // The shop ignores clicks while a favorites PUT is in flight, so wait for each one.
    CatalogPage.toggleFavorite(orbita);
    WorkspacePage.favoriteCount().should('have.text', '1');
    CatalogPage.toggleFavorite(khvylia);
    WorkspacePage.favoriteCount().should('have.text', '2');

    WorkspacePage.reload();
    WorkspacePage.favoriteCount().should('have.text', '2');
    WorkspacePage.openFavorites();
    cy.get('#favorites-list .product-card').should('have.length', 2);

    cy.get(`#favorites-list [data-favorite="${orbita.id}"]`).click();
    WorkspacePage.favoriteCount().should('have.text', '1');
    cy.get('#favorites-list .product-card').should('have.length', 1);
  });

  it('TM-FAV-002: «Почати заново» gives empty favorites, cart and compare', () => {
    CatalogPage.toggleFavorite(orbita).addToCart(orbita).toggleCompare(orbita);
    WorkspacePage.favoriteCount().should('have.text', '1');
    WorkspacePage.token().then((oldToken) => {
      WorkspacePage.startFresh();
      WorkspacePage.token().should('be.a', 'string').and('not.eq', oldToken);
    });
    WorkspacePage.favoriteCount().should('have.text', '0');
    WorkspacePage.cartCount().should('have.text', '0');
    cy.get('#compare-bar').should('not.be.visible');
  });
});
