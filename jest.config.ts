import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
    rootDir: "./",
    verbose: true,
    moduleNameMapper: {
        ".+\\.(css|styl|less|sass|scss)$": "identity-obj-proxy",
        ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
            "<rootDir>/mocks/file-mock.ts",
    },
    testPathIgnorePatterns: ["node_modules", "\\.cache"],
    testEnvironmentOptions: { url: "http://localhost" },
    testEnvironment: "node",
    collectCoverage: true,
    coverageReporters: ["text", "json", "html", ["lcov", { projectRoot: "." }], "cobertura"],
    reporters: ["default", "jest-junit"],
    testMatch: ["**/tests/**/*.[jt]s", "**/?(*.)+(spec|test).[jt]s"],
    testResultsProcessor: "jest-sonar-reporter",
};

export default config;
