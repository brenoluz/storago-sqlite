import { Model, Schema, debug, Adapter, Field, FieldKind, codeFieldError } from "@storago/orm";
import { SqliteSelect } from "./select";
import { SqliteInsert } from "./insert";
import { SqliteCreate } from "./create";
import { Database, OPEN_READWRITE, Statement } from "sqlite3";

type callbackMigration = { (transaction: SQLTransaction): Promise<void> };
type Params = string | number | null;

export class SqliteAdapter implements Adapter {

  protected db: Database;
  protected mode: number;
  protected path: string;

  constructor(path: string, mode: number = OPEN_READWRITE) {

    this.path = path;
    this.mode = mode;
  }

  public getDb(): Database {
    return this.db;
  }

  public async connect(): Promise<void> {

    return new Promise((resolve, reject) => {

      this.db = new Database(this.path, this.mode, error => {

        if (error === null) {
          resolve();
        } else {
          reject(error);
        }
      });
    });
  }

  public async prepare(sql: string, params: any[]): Promise<Statement> {

    return new Promise((resolve, reject) => {
      this.db.prepare(sql, params, (statement: Statement, err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve(statement);
        }
      })
    })
  }

  public run(sql: string, params: any[]): Promise<void> {

    return this.prepare(sql, params).then((statement: Statement) => {
      return new Promise((resolve, reject) => {
        statement.run((err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        })
      })
    })
  }

  public async get(sql: string, params: any[]): Promise<any | undefined> {

    return this.prepare(sql, params).then((statement: Statement) => {
      return new Promise((resolve, reject) => {
        statement.get((err: Error | null, row?: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        })
      })
    })
  }

  public all(sql: string, params: any[]): Promise<any[] | undefined> {

    return this.prepare(sql, params).then((statement: Statement) => {
      return new Promise((resolve, reject) => {
        statement.all((err: Error | null, rows?: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        })
      })
    })
  }

  public each(sql: string, params: any[], callback: (err: Error | null, row: any) => void): Promise<Number | undefined> {

    return this.prepare(sql, params).then((statement: Statement) => {
      return new Promise((resolve, reject) => {
        statement.each(callback, (err: Error | null, count: Number) => {
          if (err) {
            reject(err);
          } else {
            resolve(count);
          }
        })
      })
    })
  }

  /*
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
  */

  fieldTransformFromDb<F extends Field>(field: F, value: any): any {

    if (value === null) {
      return undefined;
    }

    if (field.kind == FieldKind.BOOLEAN) {
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }

      return value;
    }

    if (field.kind == FieldKind.JSON) {
      return JSON.parse(value);
    }

    if (field.kind == FieldKind.INTEGER) {
      return parseInt(value);
    }

    if ([FieldKind.DATE, FieldKind.DATETIME].indexOf(field.kind) >= 0) {
      return new Date(value);
    }

    return value;
  }

  fieldTransformToDB<F extends Field>(field: F, value: any): any {

    if (value === undefined) {
      return null;
    }

    if (field.kind == FieldKind.BOOLEAN) {
      if (value === true) {
        value = 1;
      } else if (value === false) {
        value = 0;
      }

      return value;
    }

    if (field.kind == FieldKind.JSON) {
      return JSON.stringify(value);
    }

    if ([
      FieldKind.INTEGER,
      FieldKind.BOOLEAN,
      FieldKind.TINYINT,
      FieldKind.SMALLINT,
      FieldKind.MEDIUMINT,
      FieldKind.BIGINT,
    ].indexOf(field.kind) >= 0) {
      return parseInt(value);
    }

    if ([
      FieldKind.REAL,
      FieldKind.DOUBLE,
      FieldKind.FLOAT,
    ].indexOf(field.kind) >= 0) {
      return parseFloat(value);
    }

    if ([FieldKind.DATE, FieldKind.DATETIME].indexOf(field.kind) >= 0) {
      return value.getTime();
    }

    return value;
  };

  fieldCast<F extends Field>(field: F): string {

    if ([
      FieldKind.TEXT,
      FieldKind.VARCHAR,
      FieldKind.CHARACTER,
      FieldKind.JSON,
      FieldKind.UUID].indexOf(field.kind) >= 0) {
      return 'TEXT';
    }

    if ([
      FieldKind.NUMERIC,
      FieldKind.DATETIME,
      FieldKind.DATE,
      FieldKind.DECIMAL].indexOf(field.kind) >= 0) {
      return 'NUMERIC';
    }

    if ([
      FieldKind.INTEGER,
      FieldKind.BOOLEAN,
      FieldKind.TINYINT,
      FieldKind.SMALLINT,
      FieldKind.MEDIUMINT,
      FieldKind.BIGINT,
    ].indexOf(field.kind) >= 0) {
      return 'INTEGER';
    }

    if ([
      FieldKind.REAL,
      FieldKind.DOUBLE,
      FieldKind.FLOAT,
    ].indexOf(field.kind) >= 0) {
      return 'REAL';
    }

    if ([
      FieldKind.BLOB,
    ].indexOf(field.kind) >= 0) {
      return 'BLOB';
    }

    throw { code: codeFieldError.FieldKindNotSupported, message: `FieldKind: ${ field.kind }` };
  };

  public select<A extends Adapter, M extends Model<A>>(schema: Schema<A, M>): SqliteSelect<A, M> {
    let select = new SqliteSelect<A, M>(schema);
    return select;
  }

  public insert<A extends Adapter, M extends Model<A>>(schema: Schema<A, M>): SqliteInsert<A, M> {
    let insert = new SqliteInsert<A, M>(schema);
    return insert;
  }

  public create<A extends Adapter, M extends Model<A>>(schema: Schema<A, M>): SqliteCreate<A, M> {

    let create = new SqliteCreate<A, M>(schema);
    return create;
  }
}

export type ConstructorTestModel<A extends Adapter, M extends TestModel<A>> = new (id: string, schema: TestSchema<A, M>) => M;

class TestSchema<A extends Adapter, M extends TestModel<A>> extends Schema<A, M>{

  readonly Model: ConstructorTestModel<A, M>;
  readonly name: string;
  readonly fields: Field[];

  readonly adapter: A;
}

class TestModel<A extends Adapter> extends Model<A>{

  readonly __schema: Schema<A, TestModel<A>>;

  make(): void {


  }
}

let adt = new SqliteAdapter(':memory');

let s = new TestSchema<SqliteAdapter, TestModel<SqliteAdapter>>(adt);
let a = s.getAdapter();
let m = s.newModel();

m.save().then((model: TestModel<SqliteAdapter>) => {

  return model.make();
});