/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Test files ko .test.ts extension se pehchana jayega
    testMatch: ["**/tests/**/*.test.ts"],
    // Src folder mein tests run honge
    rootDir: './',
    modulePaths: ["<rootDir>/src"],
    moduleFileExtensions: ["ts", "js"],
    // Coverage report kahan save hoga
    collectCoverageFrom: ["src/**/*.ts", "!src/server.ts", "!src/app.ts", "!src/utils/redis.ts"],
};