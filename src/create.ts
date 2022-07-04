import { Model, Schema, Create, Adapter, engineKind } from "@storago/orm";
import { WebSQLAdapter } from './adapter';

export class WebSQLCreate<M extends Model> implements Create{

  private Model: new() => M;
  private adapter: WebSQLAdapter;
  private schema: Schema<M>;
 
  constructor(model: new() => M, schema: Schema<M>, adapter: WebSQLAdapter){
    this.Model = model;
    this.adapter = adapter;
    this.schema = schema;
  }

  private getColumns() : string[] {

    const columns: string[] = [];
    let fields = this.schema.getFields();

    for(let field of fields){
      let name = field.getName();
      columns.push(`${name} ${field.castDB(this.adapter)}`);
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