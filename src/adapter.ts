import { Model, Schema, debug, Adapter, Field, FieldKind, codeFieldError } from "@storago/orm";
import { WebSQLSelect } from "./select";
import { SqliteInsert } from "./insert";
import { SqliteCreate } from "./create";

type callbackMigration = { (transaction: SQLTransaction): Promise<void> };

export class SqliteAdapter implements Adapter {

  public readonly db: Database;

  constructor(name: string, description: string, size: number) {

    if (typeof name == 'string') {
      this.db = window.openDatabase(name, '', description, size);
    }
  }

  public getVersion(): '' | number {

    let version = this.db.version as string;
    if (version !== '') {
      return parseInt(version);
    }

    return '';
  }

  public changeVersion(newVersion: number, cb: callbackMigration): Promise<void> {

    return new Promise((resolve, reject) => {

      this.db.changeVersion(String(this.getVersion()), String(newVersion), cb, reject, resolve);
    });
  }

  public async getTransaction(): Promise<SQLTransaction> {

    return new Promise((resolve, reject) => {
      this.db.transaction(resolve, reject);
    });
  }

  fieldTransformFromDb<F extends Field>(field: F, value: any): any {

    if (value === null) {
      return undefined;
    }

    if (field.kind == FieldKind.Boolean) {
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }

      return value;
    }

    if (field.kind == FieldKind.Json) {
      return JSON.parse(value);
    }

    if (field.kind == FieldKind.Integer) {
      return parseInt(value);
    }

    if ([FieldKind.Date, FieldKind.DateTime].indexOf(field.kind) >= 0) {
      return new Date(value);
    }

    return value;
  }

  fieldTransformToDB<F extends Field>(field: F, value: any): any {

    if (value === undefined) {
      return null;
    }

    if (field.kind == FieldKind.Boolean) {
      if (value === true) {
        value = 'true';
      } else if (value === false) {
        value = 'false';
      }

      return value;
    }

    if (field.kind == FieldKind.Json) {
      return JSON.stringify(value);
    }

    if (field.kind == FieldKind.Integer) {
      return parseInt(value);
    }

    if ([FieldKind.Date, FieldKind.DateTime].indexOf(field.kind) >= 0) {
      return value.getTime();
    }

    return value;
  };

  fieldCast<F extends Field>(field: F): string {

    if ([FieldKind.Text, FieldKind.Json].indexOf(field.kind) >= 0) {
      return 'TEXT';
    }

    if ([FieldKind.Numeric, FieldKind.Integer, FieldKind.DateTime, FieldKind.Date].indexOf(field.kind) >= 0) {
      return 'NUMERIC';
    }

    throw { code: codeFieldError.FieldKindNotSupported, message: `FieldKind: ${ field.kind }` };
  };

  public select<M extends Model>(model: new () => M, schema: Schema<M>): WebSQLSelect<M> {
    let select = new WebSQLSelect<M>(model, schema, this);
    return select;
  }

  public insert<M extends Model>(model: new () => M, schema: Schema<M>): SqliteInsert<M> {
    let insert = new SqliteInsert<M>(model, schema, this);
    return insert;
  }

  public create<M extends Model>(model: new () => M, schema: Schema<M>): SqliteCreate<M> {

    let create = new SqliteCreate<M>(model, schema, this);
    return create;
  }

  public query(sql: DOMString, data: ObjectArray = [], tx?: SQLTransaction): Promise<SQLResultSet> {

    return new Promise(async (resolve, reject) => {

      if (tx === undefined) {
        tx = await this.getTransaction();
      }

      if (debug.query) {
        console.log('@storago/orm', 'query', sql, data);
      }

      tx.executeSql(sql, data, (tx: SQLTransaction, result: SQLResultSet): void => {

        resolve(result);

      }, (tx: SQLTransaction, error: SQLError): boolean => {

        reject(error);
        return true;
      });
    });
  }
}