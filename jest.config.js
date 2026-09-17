/** @type {import('jest').Config} */
const preset = require('jest-expo/node/jest-preset');

module.exports = {
    preset: 'jest-expo/node',
    testMatch: ['<rootDir>/tests/**/*.test.ts'],
    setupFiles: [...(preset.setupFiles ?? []), '<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.ts$': '$1',
    },
};
