const { WorkspacePage } = require('./workspace.page');
const { CatalogPage } = require('./catalog.page');
const { CartPage } = require('./cart.page');
const { OrdersPage } = require('./orders.page');
const { ComparePage } = require('./compare.page');
const { ProductPage } = require('./product.page');
const { FavoritesPage } = require('./favorites.page');

module.exports = {
  workspacePage: new WorkspacePage(),
  catalogPage: new CatalogPage(),
  cartPage: new CartPage(),
  ordersPage: new OrdersPage(),
  comparePage: new ComparePage(),
  productPage: new ProductPage(),
  favoritesPage: new FavoritesPage(),
};
