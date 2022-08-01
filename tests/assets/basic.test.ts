
import { Database, Statement } from 'sqlite3';
import { SqliteAdapter } from '../../src';
import { SqliteCreate } from '../../src/create';
import { carShopAdapter, carSchema } from '../app';
import { CarSchema } from '../app/car/carSchema';
import { debug } from '@storago/orm';

test('test adapter', async () => {

  expect(carShopAdapter).toBeInstanceOf(SqliteAdapter);
  expect(carShopAdapter.getDb()).not.toBeInstanceOf(Database);

  //not connected
  let callQuery = carShopAdapter.all('SELECT * FROM cars LIMIT 1', []);
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
  let callQueryClose = carShopAdapter.all('SELECT * FROM cars LIMIT 1', []);
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
  expect(executed).toBeUndefined();
})

test('test insert',async () => {
  
  debug.insert = false;
  await carShopAdapter.connect();
  let create = carSchema.createTable();
  await expect(create.execute()).resolves.toBeUndefined();

  let car = carSchema.newModel();
  let insert = carSchema.insert();
  insert.add(car);

  expect(insert.render()).toBe('INSERT INTO cars (id) VALUES (?);');
  expect(insert.getValues().length).toBe(1);
  await expect(insert.execute()).resolves.toBeUndefined()
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