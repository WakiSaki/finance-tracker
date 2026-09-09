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

// GET method to get expenses within date range for dashboard
app.get('/dashboard', async (req, res) => {
    const { range } = req.query;

    const interval = getDateInterval(range);

    if(!interval) {
        return res.status(400).json({
            error: "Invalid date range"
        });
    }

    try {
        const result = await pool.query(
            `
            SELECT * FROM expenses
            WHERE expense_date >= CURRENT_DATE - $1::interval
                AND expense_date <= CURRENT_DATE;
            `,
            [interval]
        );

        res.json(result.rows);
    } catch(error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to retrieve dashboard expenses"
        });
    }
});

// GET method for expense total within date range
app.get("/dashboard/total", async (req, res) => {
    const { range } = req.query;

    const interval = getDateInterval(range);

    if(!interval) {
        return res.status(400).json({
            error: "Invalid date range"
        });
    }

    try{
        const result = await pool.query(
            `
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM expenses
            WHERE expense_date >= CURRENT_DATE - $1::interval
                AND expense_date <= CURRENT_DATE;
            `,
            [interval]
        );

        res.json(result.rows[0]);
    } catch(error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to calculate total"
        });
    }
});

// GET method for average expense amount for dashboard
app.get("/dashboard/average", async (req, res) => {
    const { range } = req.query;

    const interval = getDateInterval(range);

    if(!interval) {
        return res.status(400).json({
            error: "Invalid date range"
        });
    }

    try{
        const result = await pool.query(
            `
            SELECT COALESCE(AVG(amount), 0) AS average
            FROM expenses
            WHERE expense_date >= CURRENT_DATE - $1::interval
                AND expense_date <= CURRENT_DATE;
            `,
            [interval]
        );

        res.json(result.rows[0]);
    } catch(error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to calculate average"
        });
    }
});

// GET method for largest expense in date range
app.get("/dashboard/largest", async (req, res) => {
    const { range } = req.query;

    const interval = getDateInterval(range);

    if(!interval) {
        return res.status(400).json({
            error: "Invalid date range"
        });
    }

    try{
        const result = await pool.query(
            `
            SELECT *
            FROM expenses
            WHERE expense_date >= CURRENT_DATE - $1::interval
                AND expense_date <= CURRENT_DATE
            ORDER BY amount DESC
            LIMIT 1;
            `,
            [interval]
        );

        res.json(result.rows[0]);
    } catch(error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to calculate largest expense"
        });
    }
});

// GET method for largest category amount in date range
app.get("/dashboard/largest-category", async (req, res) => {
    const { range } = req.query;

    const interval = getDateInterval(range);

    if(!interval) {
        return res.status(400).json({
            error: "Invalid date range"
        });
    }

    try{
        const result = await pool.query(
            `
            SELECT category, SUM(amount) AS total
            FROM expenses
            WHERE expense_date >= CURRENT_DATE - $1::interval
                AND expense_date <= CURRENT_DATE
            GROUP BY category
            ORDER BY total DESC
            LIMIT 1;
            `,
            [interval]
        );

        res.json(result.rows[0] ?? null);
    } catch(error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to calculate largest category"
        });
    }
});

// GET method for totals per categories in date range
app.get("/dashboard/categories", async (req, res) => {
    const { range } = req.query;

    const interval = getDateInterval(range);

    if(!interval) {
        return res.status(400).json({
            error: "Invalid date range"
        });
    }

    try{
        const result = await pool.query(
            `
            SELECT category, SUM(amount) AS total
            FROM expenses
            WHERE expense_date >= CURRENT_DATE - $1::interval
                AND expense_date <= CURRENT_DATE
            GROUP BY category
            ORDER BY category;
            `,
            [interval]
        );

        res.json(result.rows);
    } catch(error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to calculate category totals"
        });
    }
});

// GET method for total amount per day in date range
app.get("/dashboard/daily", async (req, res) => {
    const { range } = req.query;

    const interval = getDateInterval(range);

    if(!interval) {
        return res.status(400).json({
            error: "Invalid date range"
        });
    }

    try{
        const result = await pool.query(
            `
            SELECT expense_date::text AS date, SUM(amount) AS total
            FROM expenses
            WHERE expense_date >= CURRENT_DATE - $1::interval
                AND expense_date <= CURRENT_DATE
            GROUP BY expense_date
            ORDER BY expense_date;
            `,
            [interval]
        );

        res.json(result.rows);
    } catch(error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to calculate daily spending"
        });
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