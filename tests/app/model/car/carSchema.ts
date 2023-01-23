import { Adapter, Schema, fields, ModelConstructor } from "@storago/orm";
import { CarModel, ConstructorCarModel } from "./carModel";

export class CarSchema<A extends Adapter> extends Schema<A, CarModel>{

  readonly Model: ConstructorCarModel = CarModel;
  readonly name: string = 'cars';

  fields = [
    new fields.TextField('brand'),
  ]
}
