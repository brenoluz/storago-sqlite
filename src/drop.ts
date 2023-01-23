import { ModelInterface, Schema, debug, Drop } from "@storago/orm";
import { SqliteAdapter } from "./adapter";

export type dbValueCast = string | number;

export class SqliteDrop<M extends ModelInterface> implements Drop<M>  {

  protected readonly schema: Schema<SqliteAdapter, M>;
  protected readonly adapter: SqliteAdapter;

  constructor(schema: Schema<SqliteAdapter, M>) {
    this.schema = schema;
    this.adapter = this.schema.getAdapter();
  }

  render(): string {

    let sql = `DROP TABLE IF EXISTS ${ this.schema.getName() };`;
    return sql;
  }

  public async execute(): Promise<void> {

    let sql = this.render();
    if (debug.drop) {
      console.log(sql);
    }

    return this.adapter.run(sql, []);
  }
}