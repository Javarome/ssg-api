/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
export default {
  preset: "ts-jest/presets/default-esm",
  modulePaths: ["node_modules", "src", "."],
  testEnvironment: "node",
  modulePathIgnorePatterns: ["dist\/.*", "node_modules/(?!@googlemaps)/"]
}
