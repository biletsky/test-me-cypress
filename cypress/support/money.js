/** Price helpers. Amounts are integer cents. */

const FREE_SHIPPING_FROM = 150_000;
const STANDARD_SHIPPING = 8_000;
const EXPRESS_SHIPPING = 15_000;

const welcome10 = (subtotal) => Math.floor(subtotal * 0.1);

const shipping = (delivery, subtotal) => {
  if (delivery === 'express') return EXPRESS_SHIPPING;
  return subtotal >= FREE_SHIPPING_FROM ? 0 : STANDARD_SHIPPING;
};

/**
 * @param {{ lines: Array<{ price: number, quantity: number }>, coupon?: boolean, delivery?: string }} basket
 */
const expectedQuote = ({ lines, coupon = false, delivery = 'standard' }) => {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const discount = coupon ? welcome10(subtotal) : 0;
  const ship = shipping(delivery, subtotal);
  return { subtotal, discount, shipping: ship, total: subtotal - discount + ship };
};

/**
 * Parses UI money ("2 400,00 ₴", "−240,00 ₴") into absolute cents.
 */
const parseUah = (text) => {
  const [hryvnias, cents = '00'] = String(text).replace(/[^\d,]/g, '').split(',');
  return Number(hryvnias) * 100 + Number(cents.padEnd(2, '0').slice(0, 2));
};

module.exports = {
  FREE_SHIPPING_FROM,
  STANDARD_SHIPPING,
  EXPRESS_SHIPPING,
  welcome10,
  shipping,
  expectedQuote,
  parseUah,
};
