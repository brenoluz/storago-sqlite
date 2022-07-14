import { Model, Schema, Create, Adapter } from "@storago/orm";
import { SqliteAdapter } from './adapter';

export class SqliteCreate<M extends Model> implements Create{

  private Model: new() => M;
  private adapter: SqliteAdapter;
  private schema: Schema<M>;
 
  constructor(model: new() => M, schema: Schema<M>, adapter: SqliteAdapter){
    this.Model = model;
    this.adapter = adapter;
    this.schema = schema;
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

  public execute(tx: SQLTransaction) : Promise<SQLResultSet> {

    let sql: string = this.render();
    return this.adapter.query(sql, [], tx);
  }
}