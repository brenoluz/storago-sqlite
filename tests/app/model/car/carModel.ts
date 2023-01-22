import { ModelInterface } from "@storago/orm";

export interface CarInterface extends ModelInterface{
  brand: string,
}

export type ConstructorCarModel = new (data: CarInterface) => CarModel;

export class CarModel implements CarInterface{

  id: string;
  __data: CarInterface;
  brand: string;

  make(): void {

  }
}