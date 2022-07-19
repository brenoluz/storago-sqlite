
import { exec } from 'child_process';
import { Database, Statement } from 'sqlite3';
import { SqliteAdapter } from '../../src';
import { SqliteCreate } from '../../src/create';
import { carShopAdapter, carSchema } from '../app';
import { CarSchema } from '../app/car/carSchema';

test('test adapter', async () => {

  expect(carShopAdapter).toBeInstanceOf(SqliteAdapter);
  expect(carShopAdapter.getDb()).not.toBeInstanceOf(Database);

  //not connected
  let callQuery = carShopAdapter.query('SELECT * FROM cars LIMIT 1', []);
  await expect(callQuery).rejects.toMatchObject({ code: '@storago/sqlite/adapter/DatabaseNotConnected' })

  await carShopAdapter.connect();
  expect(carShopAdapter.getDb()).toBeInstanceOf(Database);

  //force sql error syntax
  await expect(carShopAdapter.prepare('SELECT * cars', [])).rejects.toThrowError('SQLITE_ERROR: near \"cars\": syntax error');

  //test statement
  let prepared = await carShopAdapter.prepare('SELECT * FROM cars LIMIT 1', []);
  await expect(prepared).toBeInstanceOf(Statement);

  //finalize statement manually 
  await expect(new Promise((resolve, reject) => {
    prepared.finalize((err: Error) => {
      err ? reject(err) : resolve(undefined);
    })
  })).resolves.toBe(undefined);

  //close
  await carShopAdapter.close();
  let callQueryClose = carShopAdapter.query('SELECT * FROM cars LIMIT 1', []);
  await expect(callQueryClose).rejects.toMatchObject({ code: '@storago/sqlite/adapter/DatabaseNotConnected' })
})

test('test schema', async () => {

  const carSchema = new CarSchema<SqliteAdapter>(carShopAdapter);

  expect(carSchema.getAdapter()).toBeInstanceOf(SqliteAdapter);

  //contain id field or more
  expect(carSchema.getFields().length).toBeGreaterThanOrEqual(1);

  //contain column id
  expect(carSchema.getColumns()).toContain('id');
});

test('test create', async () => {

  await carShopAdapter.connect();
  let create = carSchema.createTable();

  expect(create).toBeInstanceOf(SqliteCreate)
  expect(create.render()).toBe('CREATE TABLE IF NOT EXISTS cars (id TEXT);');

  let executed = await create.execute();
  expect(executed).toEqual([]);
})

test('test select', async () => {

  let select = carSchema.select();
  expect(select.render()).toBe('SELECT cars.id, cars.rowid FROM cars;');

  select.where('id = ?', '123123');
  expect(select.render()).toBe('SELECT cars.id, cars.rowid FROM cars WHERE id = ?;');

  await carShopAdapter.connect();
  let car = await select.one();
  expect(car?.id).toBeUndefined();
})