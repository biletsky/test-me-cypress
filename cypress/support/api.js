/**
 * API client (service object): one method per endpoint.
 * Every call returns the raw response with failOnStatusCode: false,
 * so specs assert the status explicitly.
 */

const MAX_429_RETRIES = 3;

const auth = (token) => (token ? { 'X-Workspace-Token': token } : {});

const send = (options) =>
  cy.request({ failOnStatusCode: false, log: false, ...options }).then((res) => {
    Cypress.log({
      name: options.method,
      message: `${options.url} → ${res.status}`,
    });
    return res;
  });

const postWorkspace = () => send({ method: 'POST', url: '/api/workspaces' });

function createWorkspace(attempt = 0) {
  return postWorkspace().then((res) => {
    if (res.status === 429 && attempt < MAX_429_RETRIES) {
      const retryAfterSec = Number(res.headers['retry-after']) || 5;
      cy.wait(retryAfterSec * 1000, { log: false });
      return createWorkspace(attempt + 1);
    }
    expect(res.status, 'POST /api/workspaces').to.eq(201);
    expect(res.body.token, 'workspace token').to.be.a('string').and.not.be.empty;
    return res.body.token;
  });
}

const Api = {
  createWorkspace,
  postWorkspace,

  getHealth: () => send({ method: 'GET', url: '/api/health' }),

  getProducts: (qs = {}) => send({ method: 'GET', url: '/api/products', qs }),
  getProduct: (id) => send({ method: 'GET', url: `/api/products/${id}` }),

  getFavorites: (token) => send({ method: 'GET', url: '/api/favorites', headers: auth(token) }),
  putFavorites: (token, productIds) =>
    send({
      method: 'PUT',
      url: '/api/favorites',
      headers: auth(token),
      body: { product_ids: productIds },
    }),

  getReview: (token, productId) =>
    send({ method: 'GET', url: `/api/products/${productId}/review`, headers: auth(token) }),
  createReview: (token, productId, body) =>
    send({
      method: 'POST',
      url: `/api/products/${productId}/review`,
      headers: auth(token),
      body,
    }),

  createQuote: (token, body) =>
    send({ method: 'POST', url: '/api/quote', headers: auth(token), body }),

  getOrders: (token, status) =>
    send({
      method: 'GET',
      url: '/api/orders',
      headers: auth(token),
      qs: status ? { status } : {},
    }),
  getOrder: (token, id) => send({ method: 'GET', url: `/api/orders/${id}`, headers: auth(token) }),
  createOrder: (token, body) =>
    send({ method: 'POST', url: '/api/orders', headers: auth(token), body }),
  cancelOrder: (token, id) =>
    send({ method: 'POST', url: `/api/orders/${id}/cancel`, headers: auth(token) }),
};

module.exports = { Api };
