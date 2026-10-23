const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://test-me.vzl.one',
    specPattern: ['cypress/e2e/**/*.cy.js', 'cypress/smoke/**/*.cy.js'],
    supportFile: 'cypress/support/e2e.js',
    testIsolation: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    viewportWidth: 1280,
    viewportHeight: 900,
    video: true,
    videoCompression: true,
    screenshotOnRunFailure: true,
    retries: { runMode: 1, openMode: 0 },
  },
});
