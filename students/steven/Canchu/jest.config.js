// jest.config.js

module.exports = {
    collectCoverage: true,
    collectCoverageFrom: ['**/*.js'], // Include all JavaScript files for coverage analysis
    coverageReporters: ['text', 'html'], // Output coverage report as text and HTML
    // Use the testMatch option with an array of file patterns to match multiple test files
    testMatch: ['**/tests/userController.test.js', '**/tests/postModel.test.js'],
  };
  