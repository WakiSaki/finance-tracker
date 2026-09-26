const express = require('express');
const cors = require('cors');
const pool = require("./db.js");
const { getDateInterval } = require('./helpers.js');

const app = express();
app.use(cors());

const categories = [
    {id: 1, name: "Food"},
    {id: 2, name: "Utilities"},
    {id: 3, name: "Groceries"},
    {id: 4, name: "Shopping"},
    {id: 5, name: "Transportation"},
    {id: 6, name: "Entertainment"},
    {id: 7, name: "Other"}
];

// Allows Express to read JSON request bodies
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({
        message: "Finance API is running!"
    });
});

// GET method for all expenses
app.get('/expenses', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, expense_name, amount, category, expense_date::text AS expense_date FROM expenses ORDER BY expense_date DESC;"
        );

        const expenses = result.rows.map(expense => ({
            ...expense,
            amount: Number(expense.amount)
        }));

        res.json(expenses);
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve expenses" });
    }
});

// GET method for expenses displayed in the expense list
app.get('/api/expenses', async (_req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT
                id,
                expense_name AS name,
                amount::float AS amount,
                category,
                expense_date::text AS date
            FROM expenses
            ORDER BY expense_date DESC, id DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve expenses" });
    }
});

// GET method for all dashboard data within a date range
app.get('/dashboard', async (req, res) => {
    const interval = getDateInterval(req.query.range);

    const today = new Date();

    if (!interval) {
        return res.status(400).json({ error: "Invalid date range" });
    }

    try {
        const result = await pool.query(
            `
            WITH filtered_expenses AS (
                SELECT id, expense_name, amount, category, expense_date
                FROM expenses
                WHERE expense_date >= $2::date - $1::interval
                  AND expense_date <= $2::date
            ),
            category_totals AS (
                SELECT category, SUM(amount) AS total
                FROM filtered_expenses
                GROUP BY category
            ),
            daily_totals AS (
                SELECT expense_date::text AS date, SUM(amount) AS total
                FROM filtered_expenses
                GROUP BY expense_date
            )
            SELECT
                COALESCE(
                    (
                        SELECT json_agg(expense ORDER BY expense.expense_date DESC)
                        FROM (
                            SELECT id, expense_name, amount, category,
                                   expense_date::text AS expense_date
                            FROM filtered_expenses
                        ) AS expense
                    ),
                    '[]'::json
                ) AS expenses,
                COALESCE((SELECT SUM(amount) FROM filtered_expenses), 0) AS total,
                COALESCE((SELECT AVG(amount) FROM filtered_expenses), 0) AS average,
                (
                    SELECT row_to_json(largest_expense)
                    FROM (
                        SELECT id, expense_name, amount, category,
                               expense_date::text AS expense_date
                        FROM filtered_expenses
                        ORDER BY amount DESC
                        LIMIT 1
                    ) AS largest_expense
                ) AS largest_expense,
                (
                    SELECT row_to_json(largest_category)
                    FROM (
                        SELECT category, total
                        FROM category_totals
                        ORDER BY total DESC
                        LIMIT 1
                    ) AS largest_category
                ) AS largest_category,
                COALESCE(
                    (SELECT json_agg(category_totals ORDER BY category)
                     FROM category_totals),
                    '[]'::json
                ) AS category_totals,
                COALESCE(
                    (SELECT json_agg(daily_totals ORDER BY date)
                     FROM daily_totals),
                    '[]'::json
                ) AS daily_spending;
            `,
            [interval, today]
        );

        const dashboard = result.rows[0];

        res.json({
            expenses: dashboard.expenses,
            total: Number(dashboard.total),
            average: Number(dashboard.average),
            largestExpense: dashboard.largest_expense,
            largestCategory: dashboard.largest_category,
            categoryTotals: dashboard.category_totals,
            dailySpending: dashboard.daily_spending
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve dashboard data" });
    }
});

app.get('/categories', (req, res) => {
    res.json(categories);
})

// POST method to add an expense
app.post('/api/expense', async (req, res) => {
    const { name, amount, category, date } = req.body;
    const numericAmount = Number(amount);

    if (
        typeof name !== 'string' || !name.trim() ||
        typeof category !== 'string' || !category.trim() ||
        typeof date !== 'string' || !date ||
        amount === '' || !Number.isFinite(numericAmount) || numericAmount < 0
    ) {
        return res.status(400).json({
            message: 'Name, amount, category, and date are required. Amount must be non-negative.'
        });
    }

    try {
        const { rows } = await pool.query(
            `
            INSERT INTO expenses (expense_name, amount, category, expense_date)
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                expense_name AS name,
                amount::float AS amount,
                category,
                expense_date::text AS date
            `,
            [name.trim(), numericAmount, category.trim(), date]
        );

        const totalResult = await pool.query(
            'SELECT COALESCE(SUM(amount), 0)::float AS total FROM expenses'
        );

        res.status(201).json({
            expense: rows[0],
            total: totalResult.rows[0].total
        });
    } catch (error) {
        console.error('Failed to create expense:', error);
        res.status(500).json({ message: 'Failed to create expense' });
    }
});

// PUT method to update an expense
app.put('/expenses/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { name, amount, category, date } = req.body;
    const numericAmount = Number(amount);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: 'Invalid expense ID' });
    }

    if (
        typeof name !== 'string' || !name.trim() ||
        typeof category !== 'string' || !category.trim() ||
        typeof date !== 'string' || !date ||
        amount === '' || !Number.isFinite(numericAmount) || numericAmount < 0
    ) {
        return res.status(400).json({
            message: 'Name, amount, category, and date are required. Amount must be non-negative.'
        });
    }

    try {
        const { rows } = await pool.query(
            `
            UPDATE expenses
            SET expense_name = $1, amount = $2, category = $3, expense_date = $4
            WHERE id = $5
            RETURNING
                id,
                expense_name AS name,
                amount::float AS amount,
                category,
                expense_date::text AS date
            `,
            [name.trim(), numericAmount, category.trim(), date, id]
        );

        if (!rows[0]) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const totalResult = await pool.query(
            'SELECT COALESCE(SUM(amount), 0)::float AS total FROM expenses'
        );

        res.json({ expense: rows[0], total: totalResult.rows[0].total });
    } catch (error) {
        console.error('Failed to update expense:', error);
        res.status(500).json({ message: 'Failed to update expense' });
    }
});

// DELETE method to delete an expense
app.delete('/expenses/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: 'Invalid expense ID' });
    }

    try {
        const { rows } = await pool.query(
            `
            DELETE FROM expenses
            WHERE id = $1
            RETURNING
                id,
                expense_name AS name,
                amount::float AS amount,
                category,
                expense_date::text AS date
            `,
            [id]
        );

        if (!rows[0]) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const totalResult = await pool.query(
            'SELECT COALESCE(SUM(amount), 0)::float AS total FROM expenses'
        );

        res.json({ expense: rows[0], total: totalResult.rows[0].total });
    } catch (error) {
        console.error('Failed to delete expense:', error);
        res.status(500).json({ message: 'Failed to delete expense' });
    }
});

module.exports = app;