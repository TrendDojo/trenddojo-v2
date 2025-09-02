import { beforeAll, afterEach, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";

// Basic test setup without MSW for now
beforeAll(() => {
  // Setup global test environment
});

afterEach(() => {
  // Clean up after each test
  cleanup();
});

afterAll(() => {
  // Cleanup after all tests
});