import type { AnyDataModel } from "convex/server";

export type DataModel = AnyDataModel;
export type Doc<TableName extends string> = DataModel[TableName]["document"];
export type Id<TableName extends string> = string & { __tableName: TableName };
