const pg = require('pg');

const { Pool } = pg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "finance-tracker",
    password: "kimchiyang2017",
    port: 5432,
});

pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Database connected:", result.rows[0]);
    }
});

module.exports = pool;