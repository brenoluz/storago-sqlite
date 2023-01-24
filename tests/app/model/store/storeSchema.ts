import { Adapter, Schema, fields, Model } from "@storago/orm";
import { StoreInterface, StoreModel } from "./storeModel";

export class StoreSchema<A extends Adapter> extends Schema<A, Model>{

  readonly name: string = 'stores';

  fields = [
    new fields.TextField('name'),
  ]

  constructor(adapter: A) {
    super(adapter);
  }

  createFromInterface(data: StoreInterface): StoreModel {
      
    const model = new StoreModel(data.id, data.name);
    model.__data = data;

    return model;
  }
}
