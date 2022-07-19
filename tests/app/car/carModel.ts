import { Model } from "@storago/orm";

export type ConstructorCarModel = new (id: string) => CarModel;

export class CarModel extends Model{

  make(): void {

  }
}