const { Api } = require('../../support/api');
const { products } = require('../../data');

const ids = (res) => res.body.items.map((p) => p.id);
const prices = (res) => res.body.items.map((p) => p.price);

describe('API — products & filters', () => {
  let catalogSize;

  before(() => {
    Api.getProducts({ limit: 20 }).expectStatus(200).then((res) => {
      catalogSize = res.body.total;
      expect(catalogSize, 'catalog size').to.be.greaterThan(6);
    });
  });

  it('TM-API-CAT-001: default page returns 6 items and the total', () => {
    Api.getProducts().expectStatus(200).then((res) => {
      expect(res.body).to.include({ page: 1, limit: 6, total: catalogSize });
      expect(res.body.items).to.have.length(6);
    });
  });

  it('TM-API-CAT-002: limit accepts 1–20 and rejects 0 / 21 with 422', () => {
    Api.getProducts({ limit: 1 }).expectStatus(200).its('body.items').should('have.length', 1);
    Api.getProducts({ limit: 20 }).expectStatus(200);
    Api.getProducts({ limit: 0 }).expectStatus(422);
    Api.getProducts({ limit: 21 }).expectStatus(422);
    Api.getProducts({ page: 0 }).expectStatus(422);
  });

  it('TM-API-CAT-003: search by name part is case-insensitive and ignores outer spaces', () => {
    const { orbita } = products;
    ['Орбіта', 'орбіта', 'ОРБІТА', '  орбіта  '].forEach((q) => {
      Api.getProducts({ q }).expectStatus(200).then((res) => {
        expect(ids(res), `q="${q}"`).to.deep.eq([orbita.id]);
      });
    });
  });

  it('TM-API-CAT-004: category filter returns only that category', () => {
    Api.getProducts({ category: 'Audio', limit: 20 }).expectStatus(200).then((res) => {
      expect(res.body.items).to.have.length.greaterThan(0);
      res.body.items.forEach((p) => expect(p.category).to.eq('Audio'));
    });
  });

  it('TM-API-CAT-005: in_stock=true excludes products with stock=0', () => {
    Api.getProducts({ in_stock: true, limit: 20 }).expectStatus(200).then((res) => {
      expect(ids(res)).not.to.include(products.outOfStock.id);
      res.body.items.forEach((p) => expect(p.stock, p.id).to.be.greaterThan(0));
      expect(res.body.total).to.eq(catalogSize - 1);
    });
  });

  it('TM-API-CAT-006: price bounds are inclusive', () => {
    const { khvylia } = products;
    Api.getProducts({ min_price: khvylia.price, max_price: khvylia.price })
      .expectStatus(200)
      .then((res) => {
        expect(ids(res)).to.deep.eq([khvylia.id]);
      });
    Api.getProducts({ min_price: 125_000, max_price: 165_000, limit: 20 })
      .expectStatus(200)
      .then((res) => {
        expect(prices(res).sort((a, b) => a - b)).to.deep.eq([125_000, 150_000, 165_000]);
      });
  });

  it('TM-API-CAT-007: min_price > max_price → 422', () => {
    Api.getProducts({ min_price: 200_000, max_price: 100_000 }).expectStatus(422);
  });

  it('TM-API-CAT-008: price sorting is numeric in both directions', () => {
    Api.getProducts({ sort: 'price_asc', limit: 20 }).expectStatus(200).then((res) => {
      const p = prices(res);
      expect(p).to.deep.eq([...p].sort((a, b) => a - b));
    });
    Api.getProducts({ sort: 'price_desc', limit: 20 }).expectStatus(200).then((res) => {
      const p = prices(res);
      expect(p).to.deep.eq([...p].sort((a, b) => b - a));
    });
  });

  it('TM-API-CAT-009: category + price + stock + sort combine', () => {
    Api.getProducts({
      category: 'Lifestyle',
      in_stock: true,
      min_price: 30_000,
      max_price: 200_000,
      sort: 'price_desc',
      limit: 20,
    })
      .expectStatus(200)
      .then((res) => {
        const items = res.body.items;
        expect(items).to.have.length.greaterThan(1);
        items.forEach((p) => {
          expect(p.category).to.eq('Lifestyle');
          expect(p.stock).to.be.greaterThan(0);
          expect(p.price).to.be.within(30_000, 200_000);
        });
        expect(prices(res)).to.deep.eq([...prices(res)].sort((a, b) => b - a));
      });
  });

  it('TM-API-CAT-010: product details expose image, description, price, stock and specs', () => {
    const { orbita } = products;
    Api.getProduct(orbita.id).expectStatus(200).then((res) => {
      expect(res.body).to.include({ id: orbita.id, name: orbita.name, price: orbita.price, stock: orbita.stock });
      expect(res.body.image).to.be.a('string').and.not.be.empty;
      expect(res.body.description).to.be.a('string').and.not.be.empty;
      expect(res.body.specs).to.be.an('object').and.not.be.empty;
    });
    Api.getProduct('p999').expectStatus(404);
  });
});
