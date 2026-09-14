const express = require('express');
const cors = require('cors');
const pool = require("./db.js");
const { getDateInterval } = require('./helpers.js');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

const expenses = [
    {
        id: 1,
        name: "Groceries",
        amount: 70.00,
        category: "Food",
        date: "2026-09-01"
    },
    {
        id: 2,
        name: "Internet",
        amount: 100.00,
        category: "Utilities",
        date: "2025-01-22"
    }
]

const categories = [
    { id: 1, name: "Food" },
    { id: 2, name: "Utilities" },
    { id: 3, name: "Transportation" },
    { id: 4, name: "Shopping" },
    { id: 5, name: "Other" }
]

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

    if (!interval) {
        return res.status(400).json({ error: "Invalid date range" });
    }

    try {
        const result = await pool.query(
            `
            WITH filtered_expenses AS (
                SELECT id, expense_name, amount, category, expense_date
                FROM expenses
                WHERE expense_date >= CURRENT_DATE - $1::interval
                  AND expense_date <= CURRENT_DATE
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
            [interval]
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

// GET method that returns the total amount from all expenses
app.get('/expenses/total', (req, res) => {
    const total = expenses.reduce((sum, expense) => {
        return sum + expense.amount;
    }, 0);

    res.json({
        total: total
    });
});

// GET method for expense with specific ID
app.get('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);

    const expense = expenses.find(expense => expense.id === id);

    if(!expense) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    res.json(expense);
});

// GET method that returns expenses of a specified category
app.get('/expenses/category/:category', (req, res) => {
    const category = req.params.category;

    const expense = expenses.find(expense => expense.category === category);

    if(!expense) {
        return res.status(404).json({
            message: "Expense not found"
        })
    }

    res.json(expense);
});

//POST method to add an expense
app.post('/api/expense', (req, res) => {
    const newId = expenses.length > 0
    ? Math.max(...expenses.map(expense => expense.id)) + 1
    : 1;

    // Creates a new expense object using the request body
    const newExpense = {
        id: newId,
        name: req.body.name,
        amount: req.body.amount,
        category: req.body.category,
        date: req.body.date
    };

    // Validates amount
    if(newExpense.amount < 0) {
        res.status(400).json({
            message: "Amount must be a positive number"
        });
    }

    // Pushes the new expense 
    expenses.push(newExpense);
    res.status(201).json(newExpense);
});

// PUT method to update an expense
app.put('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);

    const expense = expenses.find(expense => expense.id === id);

    if(!expense) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    expense.name = req.body.name;
    expense.amount = req.body.amount;
    expense.category = req.body.category;
    expense.date = req.body.date;

    res.json(expense);
});

// DELETE method to delete an expense
app.delete('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);   // The ID of the expense to delete

    const index = expenses.findIndex(expense => expense.id === id); // Finds the index of the expense to be deleted

    // Returns a 404 error if index is not found for expense
    if(index === -1) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    // Splices the expense from the array and puts it in deletedExpense
    const deletedExpense = expenses.splice(index, 1);
    res.json(deletedExpense[0]);
});

// Starts the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
