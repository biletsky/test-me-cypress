/*
 * Quote is stateless per request, so one workspace serves the whole file
 * (keeps us far from the 30 workspaces/min soft limit).
 */

const { Api } = require('../../support/api');
const { products, coupons, basket, line } = require('../../data');
const { expectedQuote, EXPRESS_SHIPPING, STANDARD_SHIPPING } = require('../../support/money');

const pick = ({ subtotal, discount, shipping, total }) => ({ subtotal, discount, shipping, total });

describe('API — quote, promo & delivery', () => {
  let token;

  before(() => {
    Api.createWorkspace().then((t) => {
      token = t;
    });
  });

  const expectQuote = (body, expected) =>
    Api.createQuote(token, body)
      .expectStatus(200, JSON.stringify(body))
      .then((res) => {
        expect(pick(res.body)).to.deep.eq(expected);
        expect(res.body.currency).to.eq('UAH');
      });

  it('TM-API-QUOTE-001: WELCOME10 gives 10% off goods, delivery free from 1500 UAH', () => {
    const { orbita } = products;
    expectQuote(
      basket({ items: [line(orbita)], coupon: coupons.welcome10 }),
      expectedQuote({ lines: [{ price: orbita.price, quantity: 1 }], coupon: true })
    );
  });

  it('TM-API-QUOTE-002: promo code ignores case and outer spaces', () => {
    const { orbita } = products;
    const expected = expectedQuote({ lines: [{ price: orbita.price, quantity: 1 }], coupon: true });
    ['  WELCOME10  ', 'welcome10', 'Welcome10', ' welcome10 '].forEach((coupon) => {
      expectQuote(basket({ items: [line(orbita)], coupon }), expected);
    });
  });

  it('TM-API-QUOTE-003: unknown promo code → 422', () => {
    Api.createQuote(token, basket({ coupon: coupons.unknown })).expectStatus(422);
  });

  it('TM-API-QUOTE-004: standard delivery is free at exactly 1500 UAH (inclusive)', () => {
    const { khvylia } = products;
    expect(khvylia.price).to.eq(150_000);
    expectQuote(
      basket({ items: [line(khvylia)] }),
      { subtotal: 150_000, discount: 0, shipping: 0, total: 150_000 }
    );
  });

  it('TM-API-QUOTE-005: standard delivery costs 80 UAH just below 1500 UAH', () => {
    const { duha, shchodnia } = products;
    expectQuote(
      basket({ items: [line(duha), line(shchodnia)] }),
      { subtotal: 149_900, discount: 0, shipping: STANDARD_SHIPPING, total: 157_900 }
    );
  });

  it('TM-API-QUOTE-006: free-delivery threshold uses the amount before discount', () => {
    const { enerhiia } = products;
    // 1650 UAH − 10% = 1485 UAH < 1500, yet delivery stays free.
    expectQuote(
      basket({ items: [line(enerhiia)], coupon: coupons.welcome10 }),
      { subtotal: 165_000, discount: 16_500, shipping: 0, total: 148_500 }
    );
  });

  it('TM-API-QUOTE-007: express is always 150 UAH and the discount never applies to delivery', () => {
    const { orbita, idea } = products;
    expectQuote(
      basket({ items: [line(orbita)], coupon: coupons.welcome10, delivery: 'express' }),
      { subtotal: 240_000, discount: 24_000, shipping: EXPRESS_SHIPPING, total: 231_000 }
    );
    expectQuote(
      basket({ items: [line(idea)], delivery: 'express' }),
      { subtotal: 25_000, discount: 0, shipping: EXPRESS_SHIPPING, total: 40_000 }
    );
  });

  it('TM-API-QUOTE-008: several lines are summed with the promo applied', () => {
    const { orbita, duha, idea } = products;
    expectQuote(
      basket({ items: [line(orbita, 2), line(duha, 3), line(idea, 1)], coupon: coupons.welcome10 }),
      expectedQuote({
        lines: [
          { price: orbita.price, quantity: 2 },
          { price: duha.price, quantity: 3 },
          { price: idea.price, quantity: 1 },
        ],
        coupon: true,
      })
    );
  });

  it('TM-API-QUOTE-009: quantity must be 1–10', () => {
    const { idea } = products;
    Api.createQuote(token, basket({ items: [line(idea, 10)] })).expectStatus(200);
    Api.createQuote(token, basket({ items: [line(idea, 0)] })).expectStatus(422);
    Api.createQuote(token, basket({ items: [line(idea, 11)] })).expectStatus(422);
  });

  it('TM-API-QUOTE-010: quantity above stock → 409, out-of-stock product cannot be bought', () => {
    const { focus, outOfStock } = products;
    Api.createQuote(token, basket({ items: [line(focus, focus.stock)] })).expectStatus(200);
    Api.createQuote(token, basket({ items: [line(focus, focus.stock + 1)] })).expectStatus(409);
    Api.createQuote(token, basket({ items: [line(outOfStock, 1)] })).expectStatus(409);
  });

  it('TM-API-QUOTE-011: one line per product_id — duplicate lines are rejected', () => {
    const { idea } = products;
    Api.createQuote(token, basket({ items: [line(idea, 1), line(idea, 1)] })).expectStatus(422);
  });
});
