import { Model, Schema, Create, Adapter } from "@storago/orm";
import { SqliteAdapter } from "./adapter"

export class SqliteCreate<M extends Model> implements Create<M>{

  private schema: Schema<SqliteAdapter, M>;
  private adapter: SqliteAdapter;
 
  constructor(schema: Schema<SqliteAdapter, M>){

    this.schema = schema;
    this.adapter = schema.getAdapter();
  }

  private getColumns() : string[] {

    const columns: string[] = [];
    let fields = this.schema.getFields();

    for(let field of fields){
      let name = field.getName();
      columns.push(`${name} ${field.castDB<SqliteAdapter>(this.adapter)}`);
    }

    return columns;
  }

  public render() : string {

    let columns: string[] = this.getColumns();
    let sql = `CREATE TABLE IF NOT EXISTS ${this.schema.getName()} (`;
    sql += columns.join(', ');
    sql += ');';
    return sql;
  }

  public execute() : Promise<void> {

    let sql: string = this.render();
    return this.adapter.run(sql, []);
  }
}