import { Model, Schema, Create, Adapter } from "@storago/orm";

export class SqliteCreate<A extends Adapter, M extends Model<A>> implements Create<A, M>{

  private schema: Schema<A, M>;
  private adapter: A;
 
  constructor(schema: Schema<A, M>){

    this.schema = schema;
    this.adapter = schema.getAdapter();
  }

  private getColumns() : string[] {

    const columns: string[] = [];
    let fields = this.schema.getFields();

    for(let field of fields){
      let name = field.getName();
      columns.push(`${name} ${field.castDB<A>(this.adapter)}`);
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