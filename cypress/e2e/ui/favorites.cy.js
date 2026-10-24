const { workspacePage, catalogPage, favoritesPage, comparePage } = require('../../pages');
const { products } = require('../../data');

describe('UI — reviews & favorites', () => {
    const { orbita, khvylia } = products;

    beforeEach(() => {
        workspacePage.open();
    });

    it('TM-FAV-001: favorite persists on the server after reload; second click removes it', () => {
        catalogPage.toggleFavorite(orbita);
        workspacePage.favoriteCount().should('have.text', '1');
        catalogPage.toggleFavorite(khvylia);
        workspacePage.favoriteCount().should('have.text', '2');
        workspacePage.reload();
        workspacePage.favoriteCount().should('have.text', '2');
        workspacePage.openFavorites();
        favoritesPage.productCard().should('have.length', 2);
        favoritesPage.favoriteItem(orbita.id).click();
        workspacePage.favoriteCount().should('have.text', '1');
        favoritesPage.productCard.should('have.length', 1);
    });

    it('TM-FAV-002: «Почати заново» gives empty favorites, cart and compare', () => {
        catalogPage.toggleFavorite(orbita).addToCart(orbita).toggleCompare(orbita);
        workspacePage.favoriteCount().should('have.text', '1');
        workspacePage.token().then((oldToken) => {
            workspacePage.startFresh();
            workspacePage.token().should('be.a', 'string').and('not.eq', oldToken);
        });
        workspacePage.favoriteCount().should('have.text', '0');
        workspacePage.cartCount().should('have.text', '0');
        comparePage.compareBar().should('not.be.visible');
    });
});
