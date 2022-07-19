import { Adapter, Schema, Field } from "@storago/orm";
import { CarModel, ConstructorCarModel } from "./carModel";

export class CarSchema<A extends Adapter> extends Schema<A, CarModel>{

  readonly Model: ConstructorCarModel = CarModel;
  readonly name: string = 'cars';

  constructor(adapter: A){
    super(adapter);
  }
}
