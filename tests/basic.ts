import { SqliteAdapter } from "../src";

test('test version', () => {

  const adapter = new SqliteAdapter(':memory');
  expect(adapter.getVersion()).toBe('');

  expect(2 + 2).toBe(4);
});