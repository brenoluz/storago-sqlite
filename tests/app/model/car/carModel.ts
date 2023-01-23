import { ModelInterface, Model } from "@storago/orm";

export interface CarInterface{
  brand: string,
}

export type ConstructorCarModel = new (id: string, brand: string) => CarModel;

export class CarModel extends Model implements CarInterface, ModelInterface{

  brand: string;

  constructor(id: string) {

    super(id);
    //this.brand = brand;
  }
}