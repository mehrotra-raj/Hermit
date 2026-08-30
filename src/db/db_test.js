import pool from "./conn.js"

const result = await pool.query(
    `SELECT NOW()`
);

console.log("DB CONNECTED!", result);