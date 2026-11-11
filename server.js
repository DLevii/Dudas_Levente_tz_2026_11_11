require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

const dbConfig = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "fitness_db",
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("A JSON szerver működik!");
});

app.get("/berletek", async (req, res) => {
    try {
        const [eredmeny] = await pool.query(`
            SELECT
                berletek.id,
                berletek.tipus_id,
                berletek.megnevezes,
                berletek.ar,
                berletek.ervenyesseg_nap,
                berletek.elerheto,
                tipusok.nev AS tipus_nev
            FROM berletek
            INNER JOIN tipusok
                ON berletek.tipus_id = tipusok.id
            ORDER BY berletek.ar ASC
        `);

        res.json(eredmeny);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

app.get("/berletek/elerheto", async (req, res) => {
    try {
        const [eredmeny] = await pool.query(`
            SELECT *
            FROM berletek
            WHERE elerheto = 1 AND ervenyesseg_nap > 0
        `);

        res.json(eredmeny);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});


app.get("/berletek/kereses/:szoveg", async (req, res) => {
    try {
        const szoveg = req.params.szoveg;

        const [eredmeny] = await pool.query(`
            SELECT *
            FROM berletek
            WHERE nev LIKE CONCAT('%', ?, '%')
        `, [szoveg]);

        res.json(eredmeny);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});


app.get("/berletek/dragak", async (req, res) => {
    try {
        const [eredmeny] = await pool.query(`
            SELECT
                megnevezes,
                ar,
                ervenyesseg_nap
            FROM berletek
            WHERE ar > 20000
            ORDER BY ervenyesseg_nap DESC
        `);

        res.json(eredmeny);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`A szerver fut: http://localhost:${PORT}`);
});

app.listen(PORT, () => {
    console.log(`1-es feladat: http://localhost:${PORT}/berletek`);
});

app.listen(PORT, () => {
    console.log(`1-es feladat: http://localhost:${PORT}/berletek/elerheto`);
});

app.listen(PORT, () => {
    console.log(`1-es feladat: http://localhost:${PORT}/berletek/kereses/:szoveg`);
});

app.listen(PORT, () => {
    console.log(`1-es feladat: http://localhost:${PORT}/berletek/statisztika`);
});

app.listen(PORT, () => {
    console.log(`1-es feladat: http://localhost:${PORT}/berletek/dragak`);
});