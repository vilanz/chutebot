import betterSqlite3 from "better-sqlite3";

export const db = betterSqlite3("./db.sqlite");
db.pragma("journal_mode = WAL");
