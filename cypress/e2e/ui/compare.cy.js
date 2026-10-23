const { WorkspacePage, CatalogPage, ComparePage } = require('../../pages');
const { products } = require('../../data');
const { parseUah } = require('../../support/money');

describe('UI — compare', () => {
  const { orbita, khvylia, rytm, studio } = products;

  beforeEach(() => {
    WorkspacePage.open();
    CatalogPage.selectCategory('Audio');
  });

  it('TM-CMP-001: table opens only from 2 products', () => {
    CatalogPage.toggleCompare(orbita);
    ComparePage.count().should('have.text', '1');
    ComparePage.openButton().should('be.disabled');
    CatalogPage.toggleCompare(khvylia);
    ComparePage.openButton().should('be.enabled');
  });

  it('TM-CMP-002: at most 3 different products can be compared', () => {
    CatalogPage.toggleCompare(orbita).toggleCompare(khvylia).toggleCompare(rytm);
    ComparePage.count().should('have.text', '3');
    CatalogPage.show(studio).toggleCompare(studio);
    WorkspacePage.toast().should('contain', 'Можна порівняти до трьох товарів');
    ComparePage.count().should('have.text', '3');
  });

  it('TM-CMP-003: table shows price, category, stock and specs; missing value is «—»', () => {
    CatalogPage.toggleCompare(orbita).toggleCompare(khvylia);
    ComparePage.open();
    ComparePage.row('Ціна').then((cells) => {
      expect(cells.map(parseUah)).to.deep.eq([orbita.price, khvylia.price]);
    });
    ComparePage.row('Категорія').should('deep.eq', ['Аудіо', 'Аудіо']);
    ComparePage.row('Наявність').should('deep.eq', [`${orbita.stock} шт.`, `${khvylia.stock} шт.`]);
    ComparePage.row('Захист').should('deep.eq', ['—', 'IPX5']);
  });

  it('TM-CMP-004: the same characteristic is shown as one row', () => {
    CatalogPage.toggleCompare(orbita).toggleCompare(rytm);
    ComparePage.open();
    cy.get('#compare-content tbody th')
      .then(($th) => [...$th].map((th) => th.textContent.trim()))
      .then((labels) => {
        const connection = labels.filter((l) => /^З.єднання$/.test(l));
        expect(connection, 'connection rows').to.have.length(1);
      });
  });

  it('TM-CMP-005: compare list survives reload and clear removes everything', () => {
    CatalogPage.toggleCompare(orbita).toggleCompare(khvylia);
    WorkspacePage.reload();
    ComparePage.count().should('have.text', '2');
    ComparePage.clear();
    ComparePage.bar().should('not.be.visible');
    WorkspacePage.reload();
    ComparePage.bar().should('not.be.visible');
    WorkspacePage.storage().its('compare').should('be.empty');
  });
});
