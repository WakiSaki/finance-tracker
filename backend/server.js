const express = require('express');
const cors = require('cors');

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
        date: "2026-09-12"
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
app.get('/expenses', (req, res) => {
    res.json(expenses);
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
    // Creates a new expense object using the request body
    const newExpense = {
        id: expenses.length + 1,
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