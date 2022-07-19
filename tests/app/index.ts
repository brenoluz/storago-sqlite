import { SqliteAdapter } from "../../src";
import { CarSchema } from "./car/carSchema";

let adapter = new SqliteAdapter('memory');

export const carSchema = new CarSchema<SqliteAdapter>(adapter);