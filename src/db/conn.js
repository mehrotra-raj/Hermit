import pg from "pg"
const {Pool} = pg

const pool = new Pool({
    user : "hermit",
    port: 5432,
    password : "hermitpass",
    database: "hermit",
    host:"localhost"
}); 

export default pool;

