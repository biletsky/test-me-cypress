const { Api } = require('../../support/api');
const { products } = require('../../data');

const VALID_TEXT = 'Зручні, легкі й добре звучать.';

describe('API — reviews', () => {
    let token;

    beforeEach(() => {
        Api.createWorkspace().then((t) => {
            token = t;
        });
    });

    it('TM-API-REV-001: created review is returned by GET', () => {
        const { orbita } = products;
        Api.getReview(token, orbita.id).expectStatus(200).its('body.review').should('be.null');
        Api.createReview(token, orbita.id, { rating: 5, text: VALID_TEXT }).expectStatus(201);
        Api.getReview(token, orbita.id)
            .expectStatus(200)
            .its('body.review')
            .should('include', { rating: 5, text: VALID_TEXT });
    });

    it('TM-API-REV-002: second review for the same product → 409', () => {
        const { orbita } = products;
        Api.createReview(token, orbita.id, { rating: 5, text: VALID_TEXT }).expectStatus(201);
        Api.createReview(token, orbita.id, { rating: 3, text: 'Інша думка про товар' }).expectStatus(409);
        Api.getReview(token, orbita.id).expectStatus(200).its('body.review.rating').should('eq', 5);
    });

    it('TM-API-REV-003: review is isolated from another workspace', () => {
        const { orbita } = products;
        Api.createReview(token, orbita.id, { rating: 4, text: VALID_TEXT }).expectStatus(201);
        Api.createWorkspace().then((other) => {
            Api.getReview(other, orbita.id).expectStatus(200).its('body.review').should('be.null');
        });
    });

    it('TM-API-REV-004: rating must be an integer 1–5', () => {
        [0, 6, 4.5, '5'].forEach((rating) => {
            Api.createReview(token, products.khvylia.id, { rating, text: VALID_TEXT }).expectStatus(
                422,
                `rating=${JSON.stringify(rating)}`
            );
        });
    });

    it('TM-API-REV-005: text length is 10–500 after trim', () => {
        const cases = [
            { product: products.khvylia, text: `   ${'а'.repeat(9)}   `, status: 422 },
            { product: products.studio, text: 'а'.repeat(501), status: 422 },
            { product: products.duha, text: `  ${'а'.repeat(10)}  `, status: 201 },
            { product: products.shchodnia, text: 'а'.repeat(500), status: 201 },
        ];
        cases.forEach(({ product, text, status }) => {
            Api.createReview(token, product.id, { rating: 3, text }).expectStatus(
                status,
                `length=${text.length}, trimmed=${text.trim().length}`
            );
        });
    });

    it('TM-API-REV-006: HTML is stored verbatim (rendering safety is checked in UI)', () => {
        const html = '<img src=x onerror=alert(1)> Чудовий товар';
        Api.createReview(token, products.idea.id, { rating: 5, text: html }).expectStatus(201);
        Api.getReview(token, products.idea.id).expectStatus(200).its('body.review.text').should('eq', html);
    });
});
