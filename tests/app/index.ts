import { SqliteAdapter } from "../../src";
import { CarSchema } from "./car/carSchema";

export const carShopAdapter = new SqliteAdapter('/tmp/test.db');

export const carSchema = new CarSchema<SqliteAdapter>(carShopAdapter);