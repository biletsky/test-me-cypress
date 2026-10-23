const { Api } = require('../../support/api');
const { products, users, addresses, coupons, line, checkoutBody } = require('../../data');
const { expectedQuote } = require('../../support/money');

describe('API — orders', () => {
  let token;

  beforeEach(() => {
    Api.createWorkspace().then((t) => {
      token = t;
    });
  });

  const createOrder = (overrides) =>
    Api.createOrder(token, checkoutBody(overrides)).expectStatus(201).its('body');

  it('TM-API-ORD-001: approved payment creates a confirmed order with correct totals', () => {
    const { orbita } = products;
    createOrder({ items: [line(orbita)], coupon: coupons.welcome10 }).then((order) => {
      expect(order.status).to.eq('confirmed');
      expect(order.items).to.deep.eq([{ product_id: orbita.id, quantity: 1 }]);
      expect(order.totals).to.deep.include(
        expectedQuote({ lines: [{ price: orbita.price, quantity: 1 }], coupon: true })
      );

      Api.getOrder(token, order.id).expectStatus(200).then((res) => {
        expect(res.body).to.deep.include({ id: order.id, status: 'confirmed', totals: order.totals });
      });
      Api.getOrders(token).expectStatus(200).its('body.items').should('have.length', 1);
    });
  });

  it('TM-API-ORD-002: declined payment → 402 and no order is created', () => {
    Api.createOrder(token, checkoutBody({ payment: 'declined' })).expectStatus(402);
    Api.getOrders(token, 'all').expectStatus(200).its('body.items').should('be.empty');
  });

  it('TM-API-ORD-003: cancel sets status cancelled; repeated cancel → 409', () => {
    createOrder().then((order) => {
      Api.cancelOrder(token, order.id).expectStatus(200).its('body.status').should('eq', 'cancelled');
      Api.getOrder(token, order.id).expectStatus(200).its('body.status').should('eq', 'cancelled');
      Api.cancelOrder(token, order.id).expectStatus(409);
    });
  });

  it('TM-API-ORD-004: status filter returns only matching orders', () => {
    createOrder().then((kept) => {
      createOrder().then((cancelled) => {
        Api.cancelOrder(token, cancelled.id).expectStatus(200);

        const idsBy = (status) =>
          Api.getOrders(token, status)
            .expectStatus(200)
            .then((res) => res.body.items.map((o) => o.id));
        idsBy('all').should('have.members', [kept.id, cancelled.id]);
        idsBy('confirmed').should('deep.eq', [kept.id]);
        idsBy('cancelled').should('deep.eq', [cancelled.id]);
      });
    });
  });

  it('TM-API-ORD-005: another workspace gets 404 for a known order id', () => {
    createOrder().then((order) => {
      Api.createWorkspace().then((stranger) => {
        Api.getOrder(stranger, order.id).expectStatus(404);
        Api.cancelOrder(stranger, order.id).expectStatus(404);
        Api.getOrders(stranger).expectStatus(200).its('body.items').should('be.empty');
      });
      Api.getOrder(token, order.id).expectStatus(200).its('body.status').should('eq', 'confirmed');
    });
  });

  describe('customer validation (lengths are checked after trim)', () => {
    const invalid = {
      'name with 1 char after trim': { name: users.invalid.oneCharAfterTrim },
      'name longer than 80 chars': { name: 'Я'.repeat(81) },
      'malformed email': { email: users.invalid.badEmail },
      'address with 4 chars after trim': { address: addresses.invalid.fourCharsAfterTrim },
      'address longer than 200 chars': { address: 'К'.repeat(201) },
    };

    Object.entries(invalid).forEach(([title, overrides]) => {
      it(`TM-API-ORD-006: ${title} → 422, no order`, () => {
        Api.createOrder(token, checkoutBody(overrides)).expectStatus(422);
        Api.getOrders(token).expectStatus(200).its('body.items').should('be.empty');
      });
    });

    it('TM-API-ORD-007: boundary values 2 / 80 name chars and 5 / 200 address chars are accepted', () => {
      createOrder({ name: '  Ян  ', address: 'К'.repeat(5) });
      createOrder({ name: 'Я'.repeat(80), address: 'К'.repeat(200) });
    });
  });

  it('TM-API-ORD-008: independent POSTs are not idempotent — each creates an order', () => {
    const body = checkoutBody();
    Api.createOrder(token, body).expectStatus(201);
    Api.createOrder(token, body).expectStatus(201);
    Api.getOrders(token).expectStatus(200).its('body.items').should('have.length', 2);
  });
});
