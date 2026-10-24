const { workspacePage, catalogPage, comparePage } = require('../../pages');
const { products } = require('../../data');
const { parseUah } = require('../../support/money');

describe('UI — compare', () => {
  const { orbita, khvylia, rytm, studio } = products;

  beforeEach(() => {
    workspacePage.open();
    catalogPage.selectCategory('Audio');
  });

  it('TM-CMP-001: table opens only from 2 products', () => {
    catalogPage.toggleCompare(orbita);
    comparePage.count().should('have.text', '1');
    comparePage.openButton().should('be.disabled');
    catalogPage.toggleCompare(khvylia);
    comparePage.openButton().should('be.enabled');
  })

  it('TM-CMP-002: at most 3 different products can be compared', () => {
    catalogPage.toggleCompare(orbita).toggleCompare(khvylia).toggleCompare(rytm);
    comparePage.count().should('have.text', '3');
    catalogPage.show(studio).toggleCompare(studio);
    workspacePage.toast().should('contain', 'Можна порівняти до трьох товарів');
    comparePage.count().should('have.text', '3');
  });

  it('TM-CMP-003: table shows price, category, stock and specs; missing value is «—»', () => {
    catalogPage.toggleCompare(orbita).toggleCompare(khvylia);
    comparePage.open();
    comparePage.row('Ціна').then((cells) => {
      expect(cells.map(parseUah)).to.deep.eq([orbita.price, khvylia.price]);
    });
    comparePage.row('Категорія').should('deep.eq', ['Аудіо', 'Аудіо']);
    comparePage.row('Наявність').should('deep.eq', [`${orbita.stock} шт.`, `${khvylia.stock} шт.`]);
    comparePage.row('Захист').should('deep.eq', ['—', 'IPX5']);
  });

  it('TM-CMP-004: the same characteristic is shown as one row', () => {
    catalogPage.toggleCompare(orbita).toggleCompare(rytm);
    comparePage.open();

    comparePage.compareHeaders
      .then(($th) => [...$th].map((th) => {
        // Normalize text: standardize various apostrophe types
        return th.textContent.trim().replace(/[''`’]/g, "'");
      }))
      .then((labels) => {
        // Find duplicates
        const duplicates = labels.filter((item, index) => labels.indexOf(item) !== index);

        expect(
          duplicates,
          `Знайдено дублікати полів у таблиці порівняння: ${[...new Set(duplicates)].join(', ')}`
        ).to.be.empty;
      });
  });

  it('TM-CMP-005: compare list survives reload and clear removes everything', () => {
    catalogPage.toggleCompare(orbita).toggleCompare(khvylia);
    workspacePage.reload();
    comparePage.count().should('have.text', '2');
    comparePage.clear();
    comparePage.bar().should('not.be.visible');
    workspacePage.reload();
    comparePage.bar().should('not.be.visible');
    workspacePage.storage().its('compare').should('be.empty');
  });
});
