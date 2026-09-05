import { useState } from 'react';

import DashboardBlock from "./dash_components/DashboardBlock";
import DashboardPieChart from "./dash_components/DashboardPieChart";
import ExpenseChart from "./dash_components/ExpenseChart";

function Dashboard({ expenses }) {
    const [dateOption, setDateOption] = useState("30days"); // Track what date range to display

    const currentDate = new Date();
    const timeRange = new Date(currentDate);

    // Set the time range according to date option selected
    const dateRange = {
        "30days": currentDate.getDate() - 30,
        "3months": currentDate.getDate() - 90,
        "6months": currentDate.getDate() - 180,
        "1year": currentDate.getDate() - 365,
        "2years": currentDate.getDate() - (365 * 2)
    }
    timeRange.setDate(dateRange[dateOption]);

    // Filter expenses based on date range
    const expenseRange = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= timeRange && expenseDate <= currentDate;
    });

    // Calculate the total expense amount for expenses within time range
    const timeRangeTotal = expenseRange.reduce((rangeTotal, expense) => {
        rangeTotal += expense.amount;
        return rangeTotal;
    }, 0);

    // Calculate the largest expense within time range
    const largestExpense = expenseRange.length > 0
        ? expenseRange.reduce((largest, expense) =>
                expense.amount > largest.amount ? expense : largest,
            expenseRange[0]
          )
        : null;

    // Calculate the average expense cost within time range
    let averageExpenseCost = expenseRange.length > 0 
        ? timeRangeTotal / expenseRange.length
        : 0;

    // Group expenses by category for other features
    const expensesByCategory = expenseRange.reduce((groups, expense) => {
        const category = expense.category;

        // Execute if category has not been encountered yet
        if(!groups[category]) {
            groups[category] = [];
        }

        groups[category].push(expense);

        return groups;
    }, {});

    // Group expenses by date for other features
    const expensesByDate = expenseRange.reduce((groups, expense) => {
       const date = expense.date;
       
       // Execute if date has not been encountered yet
       if(!groups[date]) {
        groups[date] = [];
       }

        groups[date].push(expense);

        return groups;
    }, {});

    // Calculate the total expense amounts for each category
    const categoryTotals = Object.entries(expensesByCategory).reduce(
        (totals, [category, expenses]) => {
            totals[category] = expenses.reduce(
                (total, expense) => total + expense.amount,
                0
            );

            return totals;
        },
        {}
    );

    // Calculate the category with the largest total expense amount
    const largestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] ?? null;

    return (
        <div className="w-6/7 min-h-fit p-4 mt-4 bg-sky-50 justify-self-center
                        flex flex-col items-center
                        rounded-lg border-2 border-black"
        >
            <h1 className="font-bold text-3xl
                           p-4"
            >
                Dashboard
            </h1>
            <select value={dateOption}
                    onChange={(e) => {
                        setDateOption(e.target.value)
                    }}
                    className="p-2 m-2"
            >
                <option value="30days">Past 30 Days</option>
                <option value="3months">Past 3 months</option>
                <option value="6months">Past 6 months</option>
                <option value="1year">Past year</option>
                <option value="2years">Past 2 years</option>
            </select>
            {expenseRange.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <DashboardBlock title={"Largest Expense"} amount={`$${largestExpense.amount}`} subtitle={largestExpense.name}/>
                    <DashboardBlock title={"Average Spending"} amount={`$${averageExpenseCost.toFixed(2)}`} />
                    <DashboardBlock title={"Number of Expenses"} amount={expenseRange.length} />
                    <DashboardBlock title={"Highest Category"} amount={`$${largestCategory[1]}`} subtitle={largestCategory[0]} />
                </div>
            ) : (
                <p>No expenses available...</p>
            )}
            <div className="flex flex-row gap-4 w-full items-center pb-8">
                <DashboardPieChart data={expensesByCategory} total={timeRangeTotal}/>
                <ExpenseChart data={expensesByDate} />
            </div>
        </div>
    );
}

export default Dashboard;