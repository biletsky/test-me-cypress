const { BasePage } = require('./base.page');

class FavoritesPage extends BasePage {

    productCard() {
        return cy.get('#favorites-list .product-card');
    }

    favoriteItem(id) {
        return cy.get(`#favorites-list [data-favorite="${id}"]`);
    }
}

module.exports = { FavoritesPage };