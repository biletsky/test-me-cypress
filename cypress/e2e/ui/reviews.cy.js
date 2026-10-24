const { workspacePage, catalogPage, productPage } = require('../../pages');
const { products } = require('../../data');

describe('UI — reviews & favorites', () => {
  const { orbita } = products;

  beforeEach(() => {
    workspacePage.open();
  });

  it('TM-REV-001: review HTML is rendered as text and never executed; survives reload', () => {
    const payload = '<img src=x onerror="window.__xss=1"> Чудовий звук';

    catalogPage.openDetails(orbita);
    productPage.submitReview({ rating: 4, text: payload });
    workspacePage.toast().should('contain', 'Дякуємо за відгук');
    productPage.savedReview().find('p').should('have.text', payload);
    productPage.savedReview().find('img').should('not.exist');
    productPage.reviewForm().should('have.attr', 'hidden');

    workspacePage.reload();
    catalogPage.openDetails(orbita);
    productPage.savedReview().should('contain', '★★★★').find('p').should('have.text', payload);
  });

  it('TM-REV-002: a fresh workspace has no review from the previous one', () => {
    catalogPage.openDetails(orbita);
    productPage.submitReview({ rating: 5, text: 'Перший відгук, усе добре' });
    productPage.savedReview().should('exist');
    productPage.close();

    workspacePage.startFresh();
    catalogPage.openDetails(orbita);
    productPage.reviewForm().should('not.have.attr', 'hidden');
    productPage.savedReview().should('not.exist');
  });
});
