require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Parser } = require('json2csv');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Route for analytics list
app.get('/api/analytics', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT port_name FROM public.postgres10');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Route for specific port details
app.get('/api/port-details/:name', async (req, res) => {
    try {
        // Using TRIM to be safe against extra spaces
        const result = await pool.query('SELECT * FROM public.postgres10 WHERE TRIM(port_name) = TRIM($1)', [req.params.name]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Route for CSV Download
app.get('/api/download/:portName', async (req, res) => {
    try {
        console.log("Attempting download for:", req.params.portName);
        const result = await pool.query("SELECT * FROM public.postgres10 WHERE TRIM(port_name) = TRIM($1)", [req.params.portName]);
        
        if (result.rows.length === 0) {
            console.log("No rows found.");
            return res.status(404).send("No data found");
        }

        console.log("Rows fetched:", result.rows.length);
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(result.rows);
        
        res.header('Content-Type', 'text/csv');
        res.attachment(`${req.params.portName.trim().replace(/\s+/g, '_')}_data.csv`);
        res.send(csv);
    } catch (err) {
        console.error("SERVER ERROR:", err); // THIS WILL SHOW THE ERROR IN YOUR TERMINAL
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));