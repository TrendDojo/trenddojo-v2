import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { prismaMock, dbMock } from "./mocks/prisma";

// Mock the Prisma client
vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
  db: dbMock,
}));

// Basic test setup without MSW for now
beforeAll(() => {
  // Setup global test environment
});

afterEach(() => {
  // Clean up after each test
  cleanup();
  // Clear all mocks after each test
  vi.clearAllMocks();
});

afterAll(() => {
  // Cleanup after all tests
});