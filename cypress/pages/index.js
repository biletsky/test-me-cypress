const { WorkspacePage } = require('./workspace.page');
const { CatalogPage } = require('./catalog.page');
const { CartPage } = require('./cart.page');
const { OrdersPage } = require('./orders.page');
const { ComparePage } = require('./compare.page');
const { ProductPage } = require('./product.page');

module.exports = {
  WorkspacePage: new WorkspacePage(),
  CatalogPage: new CatalogPage(),
  CartPage: new CartPage(),
  OrdersPage: new OrdersPage(),
  ComparePage: new ComparePage(),
  ProductPage: new ProductPage(),
};
