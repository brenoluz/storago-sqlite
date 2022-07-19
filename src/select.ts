import { Model, Schema, debug, Select, paramsType, Adapter } from '@storago/orm';

type whereTuple = [string, paramsType[] | undefined];
type joinTuple = [string, string];
type orderType = "ASC" | "DESC";

export class SqliteSelect<A extends Adapter, M extends Model> implements Select<A, M> {

  private schema: Schema<A, M>;
  private adapter: A;
  private _distinct: boolean = false;
  private _from: string = '';
  private _where: whereTuple[] = [];
  private _column: string[] = [];
  private _join: joinTuple[] = [];
  private _joinLeft: joinTuple[] = [];
  private _joinRight: joinTuple[] = [];
  private _params: paramsType[] = [];
  private _order: string[] = [];
  private _offset?: number;
  private _limit?: number;

  constructor(schema: Schema<A, M>) {
    this.schema = schema;
    this.adapter = this.schema.getAdapter();
  }

  distinct(flag: boolean = true): SqliteSelect<A, M> {

    this._distinct = flag;
    return this;
  }

  limit(limit: number, offset?: number): SqliteSelect<A, M> {
    this._limit = limit;
    this._offset = offset;
    return this;
  }

  from(from: string, columns?: string[]): SqliteSelect<A, M> {

    this._from = from;
    if (!columns) {
      columns = ['*'];
    }

    columns.push('rowid');

    for (let column of columns) {
      this._column.push(`${ from }.${ column }`);
    }

    return this;
  }

  where(criteria: string, params?: paramsType[] | paramsType): SqliteSelect<A, M> {

    const _params: paramsType[] = [];
    if (params === undefined) {
      this._where.push([criteria, undefined]);
      return this;
    }

    if (!Array.isArray(params)) {
      this._where.push([criteria, [params]]);
      return this;
    }

    this._where.push([criteria, params]);
    return this;
  }

  join(tableName: string, on: string, columns?: string[]): SqliteSelect<A, M> {

    this._join.push([tableName, on]);
    if (!!columns) {
      this._column.concat(columns);
    }
    return this;
  }

  joinLeft(tableName: string, on: string, columns?: string[]): SqliteSelect<A, M> {

    this._joinLeft.push([tableName, on]);
    if (!!columns) {
      this._column.concat(columns);
    }
    return this;
  }

  joinRight(tableName: string, on: string, columns: string[]): SqliteSelect<A, M> {

    this._joinRight.push([tableName, on]);
    this._column.concat(columns);
    return this;
  }

  order(column: string, direction?: orderType) {

    if (!direction) {
      direction = 'ASC';
    }

    this._order.push(`${ column } ${ direction }`);
  }

  render(): string {

    this._params = [];
    /*
    if(!this._from && this.Table){
      this.from(this.Table.schema.name);
    }*/

    let sql = 'SELECT ';
    if (this._distinct) {
      sql += 'DISTINCT ';
    }

    sql += this._column.join(', ');
    sql += ` FROM ${ this._from }`;

    //join
    if (this._join.length > 0) {
      for (let join of this._join) {
        sql += ` JOIN ${ join[0] } ON ${ join[1] }`;
      }
    }

    //left join
    if (this._joinLeft.length > 0) {
      for (let join of this._joinLeft) {
        sql += ` JOIN LEFT ${ join[0] } ON ${ join[1] }`;
      }
    }

    //where
    let where_size = this._where.length;
    let whereAndLimit = where_size - 1;
    if (where_size > 0) {
      sql += ' WHERE ';
      for (let w in this._where) {
        let i: number = parseInt(w);
        let where = this._where[w];
        sql += where[0];
        if (whereAndLimit != i) {
          sql += ' AND ';
        }
        if (where[1] !== undefined) {
          this._params = this._params.concat(where[1]);
        }
      }
    }

    sql += this._order.join(' ');

    if (this._limit !== undefined) {
      sql += ` LIMIT ${ this._limit }`;
    }

    if (this._offset !== undefined) {
      sql += ` OFFSET ${ this._offset }`;
    }

    sql += ';';
    return sql;
  }

  toString(): string {
    return this.render();
  }

  public execute(): Promise<any[] | undefined> {

    let sql: string = this.render();
    return this.adapter.query(sql, this._params);
  }

  public async all(): Promise<M[]> {

    let promises: Promise<M>[] = [];
    let result = await this.execute();

    for (let i = 0; result.length > i; i++) {
      let row = result[i];
      promises.push(this.schema.populateFromDB(row));
    }

    let rowset = await Promise.all(promises);
    if (debug.select) {
      console.log('@storago/orm', 'select:rowset', rowset);
    }

    return rowset;
  }

  public async one(): Promise<M> {
    this.limit(1);
    let rowset = await this.all();
    return rowset[0];
  }
}