import { Model, Schema, debug, Adapter, engineKind } from "@storago/orm";
import { WebSQLSelect } from "./select";
import { WebSQLInsert } from "./insert";
import { WebSQLCreate } from "./create";

type callbackMigration = {(transaction: SQLTransaction) : Promise<void>};

export class WebSQLAdapter implements Adapter {

  public readonly db: Database;
  public readonly engine: engineKind = engineKind.WebSQL;

  constructor(name: string, description: string, size: number) {

    if(typeof name == 'string'){
      this.db = window.openDatabase(name, '', description, size);
    }
  }

  public getVersion(): ''|number {

    let version = this.db.version as string;
    if (version !== '') {
      return parseInt(version);
    }
    
    return '';
  }

  public changeVersion(newVersion: number, cb: callbackMigration) : Promise<void>{

    return new Promise((resolve, reject) => {

      this.db.changeVersion(String(this.getVersion()), String(newVersion), cb, reject, resolve);
    });
  }

  public async getTransaction(): Promise<SQLTransaction> {

    return new Promise((resolve, reject) => {
      this.db.transaction(resolve, reject);
    });
  }

  public select<M extends Model>(model: new() => M, schema: Schema<M>): WebSQLSelect<M> {
    let select = new WebSQLSelect<M>(model, schema, this);
    return select;
  }

  public insert<M extends Model>(model: new() => M, schema: Schema<M>): WebSQLInsert<M> {
    let insert = new WebSQLInsert<M>(model, schema, this);
    return insert;
  }

  public create<M extends Model>(model: new() => M, schema: Schema<M>) : WebSQLCreate<M> {

    let create = new WebSQLCreate<M>(model, schema, this);
    return create;
  }

  public query(sql: DOMString, data: ObjectArray = [], tx?: SQLTransaction): Promise<SQLResultSet> {

    return new Promise(async (resolve, reject) => {

      if(tx === undefined){
        tx = await this.getTransaction();
      }

      if(debug.query){
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