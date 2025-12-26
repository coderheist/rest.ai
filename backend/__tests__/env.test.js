import { describe, test, expect } from '@jest/globals';

describe('Environment Setup', () => {
  test('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('should have MongoDB URI configured', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
  });

  test('should have JWT secret configured', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
  });
});
