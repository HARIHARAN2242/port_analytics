require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Parser } = require('json2csv');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// ===========================
// MAP DATA API
// ===========================
app.get('/api/analytics', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT
                port_name,
                lat,
                lng
            FROM postgres10
            WHERE lat IS NOT NULL
              AND lng IS NOT NULL
        `);

        res.json(result.rows);

    } catch (err) {
        console.error('Analytics API Error:', err);
        res.status(500).json({
            error: err.message
        });
    }
});

// ===========================
// PORT DETAILS API
// ===========================
app.get('/api/port-details/:name', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM postgres10
             WHERE TRIM(port_name) = TRIM($1)`,
            [req.params.name]
        );

        res.json(result.rows);

    } catch (err) {
        console.error('Port Details Error:', err);
        res.status(500).json({
            error: err.message
        });
    }
});

// ===========================
// CSV DOWNLOAD API
// ===========================
app.get('/api/download/:portName', async (req, res) => {
    try {

        const result = await pool.query(
            `SELECT *
             FROM postgres10
             WHERE TRIM(port_name) = TRIM($1)`,
            [req.params.portName]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('No data found');
        }

        const parser = new Parser();
        const csv = parser.parse(result.rows);

        res.header('Content-Type', 'text/csv');
        res.attachment(
            `${req.params.portName.replace(/\s+/g, '_')}.csv`
        );

        res.send(csv);

    } catch (err) {
        console.error('CSV Download Error:', err);
        res.status(500).send(err.message);
    }
});

// ===========================
// DATABASE TEST API
// ===========================
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT COUNT(*) FROM postgres10'
        );

        res.json({
            success: true,
            rows: result.rows[0].count
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ===========================
// GLOBAL ERROR HANDLER
// ===========================
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

// ===========================
// START SERVER
// ===========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});