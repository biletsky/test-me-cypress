/**
 * Test data layer: static fixtures + request builders.
 * JSON is required synchronously (bundled by Cypress), so specs get plain objects
 * instead of nested cy.fixture() callbacks.
 */

const users = require('../fixtures/users.json');
const addresses = require('../fixtures/addresses.json');
const products = require('../fixtures/products.json');
const checkout = require('../fixtures/checkout.json');

const customer = ({ userKey = 'valid', addressKey = 'kyiv' } = {}) => ({
  name: users[userKey].name,
  email: users[userKey].email,
  address: addresses[addressKey].address,
});

const line = (product, quantity = 1) => ({ product_id: product.id, quantity });

/** Body for POST /api/quote. */
const basket = ({ items = [line(products.orbita)], coupon = '', delivery = 'standard' } = {}) => ({
  items,
  coupon,
  delivery,
});

/** Body for POST /api/orders: valid by default, override any field. */
const checkoutBody = (overrides = {}) => ({
  ...basket(),
  ...customer(),
  payment: 'approved',
  ...overrides,
});

module.exports = {
  users,
  addresses,
  products,
  coupons: checkout.coupons,
  customer,
  line,
  basket,
  checkoutBody,
};
