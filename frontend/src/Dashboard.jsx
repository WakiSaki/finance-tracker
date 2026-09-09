import { useState, useEffect } from 'react';

import DashboardBlock from "./dash_components/DashboardBlock";
import DashboardPieChart from "./dash_components/DashboardPieChart";
import ExpenseChart from "./dash_components/ExpenseChart";

function Dashboard() {
    const [dateOption, setDateOption] = useState("30days"); // Track what date range to display
    const [expenseRange, setExpenseRange] = useState([]);   // Track the expenses within date range
    const [timeRangeTotal, setTimeRangeTotal] = useState(0);    // Track the total expense amount within date range
    const [timeRangeAverage, setTimeRangeAverage] = useState(0);    // Track the average expense amount within date range
    const [largestExpense, setLargestExpense] = useState(null); // Track the largest expense within date range
    const [largestCategory, setLargestCategory] = useState(null);   // Track the largest category amount within date range
    const [categoryTotals, setCategoryTotals] = useState([]);   // Track the totals per category within date range
    const [dailySpending, setDailySpending] = useState([]); // Track the spending per day within date range

    // Request expense data based on date range selected
    useEffect(() => {
        // Get all expenses from database
        fetch(`http://localhost:3000/dashboard?range=${dateOption}`)
            .then(response => response.json())
            .then(data => {
                setExpenseRange(data);
            });
        // Get expense total from database
        fetch(`http://localhost:3000/dashboard/total?range=${dateOption}`)
            .then(response => response.json())
            .then(data => {
                setTimeRangeTotal(Number(data.total));
            });
        // Get average expense amount from database
        fetch(`http://localhost:3000/dashboard/average?range=${dateOption}`)
            .then(response => response.json())
            .then(data => {
                setTimeRangeAverage(Number(data.average));
            });
        // Get largest expense from database
        fetch(`http://localhost:3000/dashboard/largest?range=${dateOption}`)
            .then(response => response.json())
            .then(data => {
                setLargestExpense(data);
            });
        // Get largest category amount from database
        fetch(`http://localhost:3000/dashboard/largest-category?range=${dateOption}`)
            .then(response => response.json())
            .then(data => {
                setLargestCategory(data);
            });
        // Get totals for each category in database
        fetch(`http://localhost:3000/dashboard/categories?range=${dateOption}`)
            .then(response => response.json())
            .then(data => {
                setCategoryTotals(data);
            });
        // Get daily totals from database
        fetch(`http://localhost:3000/dashboard/daily?range=${dateOption}`)
            .then(response => response.json())
            .then(data => {
                setDailySpending(data);
        });
    }, [dateOption]);

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
            {expenseRange.length > 0 && largestExpense && largestCategory ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <DashboardBlock title={"Largest Expense"} amount={`$${largestExpense.amount}`} subtitle={largestExpense.expense_name}/>
                    <DashboardBlock title={"Average Spending"} amount={`$${timeRangeAverage.toFixed(2)}`} />
                    <DashboardBlock title={"Number of Expenses"} amount={expenseRange.length} />
                    <DashboardBlock title={"Highest Category"} amount={`$${Number(largestCategory.total).toFixed(2)}`} subtitle={largestCategory.category} />
                </div>
            ) : (
                <p>No expenses available...</p>
            )}
            <div className="flex flex-row gap-4 w-full items-center pb-8">
                <DashboardPieChart data={categoryTotals} total={timeRangeTotal}/>
                <ExpenseChart data={dailySpending} />
            </div>
        </div>
    );
}

export default Dashboard;