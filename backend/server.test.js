import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import app from "./server.js";
import pool from "./db.js";

// Resets test database before each test to ensure consistent data testing
beforeEach(async () => {
    await pool.query(`
        TRUNCATE TABLE expenses RESTART IDENTITY;

        INSERT INTO expenses (expense_name, amount, category, expense_date)
        VALUES
            ('Groceries', 70.00, 'Food', '2026-09-10'),
            ('Internet', 100.00, 'Utilities', '2026-09-15'),
            ('Gas', 40.00, 'Transportation', '2026-09-20'),
            ('Restaurant', 50.00, 'Food', '2026-09-22');
    `);
});

// Pretends the date is Sep. 26, 2026 when testing
beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-26T12:00:00"));
});

// Restore clock after testing
afterEach(() => {
    vi.useRealTimers();
});

describe("GET /dashboard", () => {
    // Test each date range for a valid response
    test.each(["30days", "3months", "6months", "1year", "2years"])("accepts the valid date range: %s", async (range) => {
        const response = await request(app)
            .get(`/dashboard?range=${range}`);

        expect(response.status).toBe(200);
    });

    // Test whether the dashboard endpoint rejects invalid date ranges
    test("reject an invalid date range", async () => {
        const response = await request(app)
            .get("/dashboard?range=invalid");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: "Invalid date range"
        });
    });

    test("reject an empty date range", async () => {
        const response = await request(app)
            .get("/dashboard");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: "Invalid date range"
        });
    });

    // Test whether the request body contains the correct data
    test("returns the correct dashboard values with the correct types", async () => {
        const response = await request(app)
            .get("/dashboard?range=30days");
        
        expect(response.status).toBe(200);

        expect(Array.isArray(response.body.expenses)).toBe(true);
        expect(typeof response.body.total).toBe("number");
        expect(typeof response.body.average).toBe("number");
        expect(typeof response.body.largestExpense).toBe("object");
        expect(typeof response.body.largestCategory).toBe("object");
        expect(Array.isArray(response.body.categoryTotals)).toBe(true);
        expect(Array.isArray(response.body.dailySpending)).toBe(true);
    });

    // Test if the total is correctly calculated
    test("returns the correct total", async () => {
        const response = await request(app)
            .get("/dashboard?range=30days");

        expect(response.status).toBe(200);
        expect(response.body.total).toBe(260);
    });

    // Test if the average is correctly calculated
    test("returns the correct average", async () => {
        const response = await request(app)
            .get("/dashboard?range=30days");

        expect(response.status).toBe(200);
        expect(response.body.average).toBe(65);
    });

    // Test if the largest expense is correctly calculated
    test("returns the correct largest expense", async () => {
        const response = await request(app)
            .get("/dashboard?range=30days");

        expect(response.status).toBe(200);
        expect(response.body.largestExpense).toEqual({
            id: 2,
            expense_name: "Internet",
            amount: 100,
            category: "Utilities",
            expense_date: '2026-09-15'
        });
    });

    // Test if the largest category is correctly calculated
    test("returns the correct largest category", async () => {
        const response = await request(app)
            .get("/dashboard?range=30days");

        expect(response.status).toBe(200);
        expect(response.body.largestCategory).toEqual({
            category: "Food",
            total: 120
        });
    });

    // Test if the category totals are correctly calculated
    test("returns the correct category totals", async () => {
        const response = await request(app)
            .get("/dashboard?range=30days");

        expect(response.status).toBe(200);
        expect(response.body.categoryTotals).toEqual([
            {category: "Food", total: 120},
            {category: "Transportation", total: 40},
            {category: "Utilities", total: 100},
        ]);
    });

    // Test if the daily spendings are correctly calculated
    test("returns the correct daily spending", async () => {
        const response = await request(app)
            .get("/dashboard?range=30days");

        expect(response.status).toBe(200);

        expect(response.body.dailySpending).toEqual([
            { date: "2026-09-10", total: 70 },
            { date: "2026-09-15", total: 100 },
            { date: "2026-09-20", total: 40 },
            { date: "2026-09-22", total: 50 }
        ]);
    });

    // Test is multiple expenses on the same day are correctly grouped
    test("groups multiple expenses on the same day", async () => {
        await pool.query(`
            INSERT INTO expenses (expense_name, amount, category, expense_date)
            VALUES ('Coffee', 10.00, 'Food', '2026-09-22');
        `);

        const response = await request(app)
            .get("/dashboard?range=30days");

        expect(response.status).toBe(200);

        expect(response.body.dailySpending).toEqual([
            { date: "2026-09-10", total: 70 },
            { date: "2026-09-15", total: 100 },
            { date: "2026-09-20", total: 40 },
            { date: "2026-09-22", total: 60 }
        ]);
    });

    test("excludes expenses outside the selected date range", async () => {
        await pool.query(`
            INSERT INTO expenses (expense_name, amount, category, expense_date)
            VALUES ('Old Expense', 500.00, 'Other', '2026-08-01');
        `);

        const response = await request(app)
            .get("/dashboard?range=30days");

        expect(response.status).toBe(200);

        expect(response.body.total).toBe(260);
    });

    test("returns empty data when no expenses are in the selected range", async () => {
        await pool.query("TRUNCATE TABLE expenses RESTART IDENTITY;");

        const response = await request(app)
            .get("/dashboard?range=30days");

        expect(response.status).toBe(200);
        expect(response.body.total).toBe(0);
        expect(response.body.average).toBe(0);
        expect(response.body.categoryTotals).toEqual([]);
        expect(response.body.dailySpending).toEqual([]);
    });
});