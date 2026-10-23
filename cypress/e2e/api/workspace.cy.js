const { Api } = require('../../support/api');
const { basket, checkoutBody } = require('../../data');

describe('API — health & workspace', () => {
  it('TM-API-WS-001: health returns version and dataset', () => {
    Api.getHealth().expectStatus(200).then((res) => {
      expect(res.body).to.include({ status: 'ok' });
      expect(res.body).to.have.all.keys('status', 'version', 'seed');
    });
  });

  it('TM-API-WS-002: POST /api/workspaces returns 201 with token and expiry', () => {
    Api.postWorkspace().expectStatus(201).then((res) => {
      expect(res.body.token).to.be.a('string').and.have.length.greaterThan(8);
      const ttlHours = (Date.parse(res.body.expires_at) - Date.now()) / 3_600_000;
      expect(ttlHours, 'token TTL, hours').to.be.within(23.5, 24.1);
    });
  });

  const protectedCalls = {
    'GET /api/favorites': (t) => Api.getFavorites(t),
    'PUT /api/favorites': (t) => Api.putFavorites(t, []),
    'GET /api/products/p01/review': (t) => Api.getReview(t, 'p01'),
    'POST /api/products/p01/review': (t) => Api.createReview(t, 'p01', { rating: 5, text: 'Чудовий товар' }),
    'POST /api/quote': (t) => Api.createQuote(t, basket()),
    'GET /api/orders': (t) => Api.getOrders(t),
    'POST /api/orders': (t) => Api.createOrder(t, checkoutBody()),
  };

  Object.entries(protectedCalls).forEach(([name, call]) => {
    it(`TM-API-WS-003: ${name} without / with invalid token → 401`, () => {
      call(undefined).expectStatus(401);
      call('not-a-real-token').expectStatus(401);
    });
  });
});
