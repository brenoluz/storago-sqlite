import { Adapter, Schema, Field, ModelConstructor } from "@storago/orm";
import { CarModel, ConstructorCarModel, CarInterface } from "./carModel";

export class CarSchema<A extends Adapter> extends Schema<A, CarInterface>{

  readonly Model?: ConstructorCarModel = CarModel;
  readonly name: string = 'cars';

  constructor(adapter: A){
    super(adapter);
  }
}
