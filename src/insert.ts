import { Model, Schema, debug, Insert, Adapter } from "@storago/orm";

export type dbValueCast = string | number;

export class SqliteInsert<A extends Adapter, M extends Model<A>> implements Insert<A, M>  {

  protected readonly schema: Schema<A, M>;
  protected readonly adapter: A;
  protected values: dbValueCast[] = [];
  protected objects: M[] = [];

  constructor(schema: Schema<A, M>) {
    this.schema = schema;
    this.adapter = this.schema.getAdapter();
  }

  add(row: M): void {

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

        this.values.push(field.toDB<A, M>(this.adapter, obj)); //guarda os valores para gravar no banco

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
    if (debug.insert) {
      console.log(sql, this.values);
    }


    return this.adapter.query(sql, this.values);
  }

  public async save(): Promise<void> {

    let result = await this.execute();
    console.log('result', result);
  }
}