import { SqliteAdapter } from "../src";

test('test version', () => {

  const adapter = new SqliteAdapter('test', '', 5);
  expect(adapter.getVersion()).toBe('');

  expect(2 + 2).toBe(4);
});