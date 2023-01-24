import { Adapter, Schema, fields, ModelInterface, ModelConstructor, Model } from "@storago/orm";

export interface StoreInterface extends ModelInterface {
  name: string;
}

export class StoreSchema<A extends Adapter> extends Schema<A, Model>{

  readonly Model: ModelConstructor<Model> = Model;
  readonly name: string = 'stores';

  fields = [
    new fields.TextField('name'),
  ]

  constructor(adapter: A) {
    super(adapter);
  }
}
