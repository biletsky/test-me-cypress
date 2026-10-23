const { Api } = require('../../support/api');
const { products } = require('../../data');

describe('API — favorites', () => {
  let token;

  beforeEach(() => {
    Api.createWorkspace().then((t) => {
      token = t;
    });
  });

  it('TM-API-FAV-001: saved favorites are returned by GET (server-side persistence)', () => {
    const { orbita, khvylia } = products;
    Api.getFavorites(token).expectStatus(200).its('body.product_ids').should('be.empty');
    Api.putFavorites(token, [orbita.id, khvylia.id]).expectStatus(200);
    Api.getFavorites(token)
      .expectStatus(200)
      .its('body.product_ids')
      .should('have.members', [orbita.id, khvylia.id]);
  });

  it('TM-API-FAV-002: duplicates are collapsed', () => {
    const { orbita, khvylia } = products;
    Api.putFavorites(token, [orbita.id, orbita.id, khvylia.id])
      .expectStatus(200)
      .its('body.product_ids')
      .should('have.members', [orbita.id, khvylia.id]);
  });

  it('TM-API-FAV-003: removing an item (toggle off) persists', () => {
    const { orbita, khvylia } = products;
    Api.putFavorites(token, [orbita.id, khvylia.id]).expectStatus(200);
    Api.putFavorites(token, [khvylia.id]).expectStatus(200);
    Api.getFavorites(token).expectStatus(200).its('body.product_ids').should('have.members', [khvylia.id]);
  });

  it('TM-API-FAV-004: favorites are invisible to another workspace', () => {
    Api.putFavorites(token, [products.orbita.id]).expectStatus(200);
    Api.createWorkspace().then((other) => {
      Api.getFavorites(other).expectStatus(200).its('body.product_ids').should('be.empty');
    });
  });

  it('TM-API-FAV-005: unknown product id → 422', () => {
    Api.putFavorites(token, ['p999']).expectStatus(422);
  });
});
