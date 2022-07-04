import { Model, Schema, debug, Insert } from "@storago/orm";
import { WebSQLAdapter } from "./adapter";


export type dbValueCast = string | number;

export class WebSQLInsert<M extends Model> implements Insert {

  protected Model: new() => M;
  protected schema: Schema<M>;
  protected adapter: WebSQLAdapter;
  protected values: dbValueCast[] = [];
  protected objects: Model[] = [];

  constructor(model: new() => M, schema: Schema<M>, adapter: WebSQLAdapter) {
    this.Model = model;
    this.adapter = adapter;
    this.schema = schema;
  }

  add(row: Model): void {

    this.objects.push(row);
  }

  render(): string {

    let fields = this.schema.getFields();

    let length = fields.length - 1;
    let sql = `INSERT INTO ${ this.schema.getName() } (`;
    for (let i in fields) {

      let index = parseInt(i);
      let field = fields[i];
      let name = field.getName();
      sql += `"${ name }"`;
      if (index < length) {
        sql += ', ';
      }
    }

    sql += ') VALUES';

    let o_size = this.objects.length - 1;
    for (let o in this.objects) {

      let o_index = parseInt(o);
      let obj = this.objects[o];

      sql += ' (';

      for (let i in fields) {

        let index = parseInt(i);
        let field = fields[i];

        this.values.push(field.toDB(obj)); //guarda os valores para gravar no banco

        sql += '?';
        if (index < length) {
          sql += ', ';
        }
      }
      
      sql += ')';

      if (o_index < o_size) {
        sql += ', ';
      }
    }

    sql += ';';

    return sql;
  }

  public async execute(): Promise<SQLResultSet> {

    let sql = this.render();
    if(debug.insert){
      console.log(sql, this.values);
    }
    

    return this.adapter.query(sql, this.values);
  }

  public async save() : Promise<void>{

    let result = await this.execute();
    console.log('result', result);
  }
}