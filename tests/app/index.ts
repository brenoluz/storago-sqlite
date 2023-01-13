import { SqliteAdapter } from "../../src";
import { CarSchema } from "./car/carSchema";

export const carShopAdapter = new SqliteAdapter(':memory:');

export const carSchema = new CarSchema<SqliteAdapter>(carShopAdapter);