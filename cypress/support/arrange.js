/** Creates data through the API in the workspace the open browser already has. */

const { Api } = require('./api');
const { WorkspacePage } = require('../pages');
const { checkoutBody } = require('../data');

const seedOrder = (overrides = {}) =>
  WorkspacePage.token().then((token) =>
    Api.createOrder(token, checkoutBody(overrides)).expectStatus(201, 'seed order').its('body')
  );

const cancelOrder = (orderId) =>
  WorkspacePage.token().then((token) =>
    Api.cancelOrder(token, orderId).expectStatus(200)
  );

module.exports = { seedOrder, cancelOrder };
