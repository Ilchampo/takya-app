/** @type {import('jest').Config} */
const preset = require('jest-expo/node/jest-preset');

module.exports = {
    preset: 'jest-expo/node',
    testMatch: ['<rootDir>/__tests__/unit/**/*.test.ts', '<rootDir>/__tests__/unit/**/*.test.tsx'],
    setupFiles: [...(preset.setupFiles ?? []), '<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.ts$': '$1',
    },
};
