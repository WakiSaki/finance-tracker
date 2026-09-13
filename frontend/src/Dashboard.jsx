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
        const controller = new AbortController();

        async function loadDashboard() {
            try {
                const response = await fetch(
                    `http://localhost:3000/dashboard?range=${dateOption}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("Could not load dashboard data");
                }

                const data = await response.json();

                setExpenseRange(data.expenses);
                setTimeRangeTotal(data.total);
                setTimeRangeAverage(data.average);
                setLargestExpense(data.largestExpense);
                setLargestCategory(data.largestCategory);
                setCategoryTotals(data.categoryTotals);
                setDailySpending(data.dailySpending);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error(error);
                }
            }
        }

        loadDashboard();

        return () => controller.abort();
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