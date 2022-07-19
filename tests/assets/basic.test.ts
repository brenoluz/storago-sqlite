import { carSchema } from '../app';

test('test select', () => {

  let select = carSchema.select();
  console.log(select.render());

  expect(select.render()).toBe('SELECT cars.id, cars.rowid FROM cars;');
})