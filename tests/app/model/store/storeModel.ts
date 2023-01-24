import { Model } from "@storago/orm";

export interface StoreInterface {
  readonly id: string;
  name: string;
}

export class StoreModel extends Model implements StoreInterface {

  public name: string;

  constructor(id: string, name: string) {

    super(id);
    this.name = name;
  }
}