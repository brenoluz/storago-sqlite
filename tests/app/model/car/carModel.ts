import { Model } from "@storago/orm";

export interface CarInterface {
  readonly id: string,
  brand: string,
}

//export type ConstructorCarModel = new (id: string, brand: string) => CarModel;

export class CarModel extends Model implements CarInterface {

  public brand: string;

  constructor(id: string, brand: string) {

    super(id);
    this.brand = brand;
  }
}