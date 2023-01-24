import { Adapter, Schema, fields } from "@storago/orm";
import { CarModel, CarInterface } from "./carModel";

export class CarSchema<A extends Adapter> extends Schema<A, CarModel>{

  //readonly Model: ConstructorCarModel = CarModel;
  readonly name: string = 'cars';

  fields = [
    new fields.TextField('brand'),
  ]

  createFromInterface(data: CarInterface) : CarModel {

    let carModel = new CarModel(data.id, data.brand);
    carModel.brand = data.brand;
    return carModel
  }
}
