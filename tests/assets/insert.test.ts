import { Database, Statement } from 'sqlite3';
import { SqliteAdapter } from '../../src';
import { SqliteCreate } from '../../src/create';
import { carShopAdapter, carSchema } from '../app';
import { CarSchema } from '../app/model/car/carSchema';
import { debug } from '@storago/orm';
import { CarModel } from '../app/model/car/carModel';

beforeAll(async () => {

  debug.insert = false;
  await carShopAdapter.connect();
  let create = carSchema.createTable();
  await expect(create.execute()).resolves.toBeUndefined();
});

afterAll(async () => {
  let carDrop = carSchema.drop();
  await expect(carDrop.execute()).resolves.toBeUndefined();
});

test('test insert same instance three times', async () => {

});
