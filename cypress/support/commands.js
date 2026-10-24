/**
 * cy.request(...).expectStatus(422)
 * A response never changes, so `.its('status').should(...)` would only burn
 * defaultCommandTimeout on failure. This asserts once and fails fast.
 */
Cypress.Commands.add('expectStatus', { prevSubject: true }, (res, status, message) => {
    expect(res.status, message || 'HTTP status').to.eq(status);
    return res;
});
