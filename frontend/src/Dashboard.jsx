import DashboardBlock from "./DashboardBlock";
import DashboardPieChart from "./DashboardPieChart";

function Dashboard({ expenses, total, categories }) {

    const sortedExpenses = [...expenses];
    sortedExpenses.sort((a, b) => b.amount - a.amount);
    const largestExpense = sortedExpenses[0];

    let averageExpenseCost = total / expenses.length;

    // Calculate total amounts for each category
    const categoryTotals = expenses.reduce((totals, expense) => {
        const category = expense.category;  // Store the expense's category

        // Only runs if the category has not yet been encountered
        if(!totals[category]) {
            totals[category] = 0;
        }

        totals[category] += expense.amount; // Add the expense's amount to the category total

        return totals;
    }, {});

    const pieChartData = Object.entries(categoryTotals).map(
        ([category, amount]) => ({
            category,
            amount
        })
    );

    // Calculate the category with the highest combined total
    const highestCategory = Object.entries(categoryTotals).length > 0
        ? Object.entries(categoryTotals).reduce((highest, current) => {
            return current[1] > highest[1] ? current : highest;
        })
        : ["", 0];

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
            {expenses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <DashboardBlock title={"Largest Expense"} amount={`$${largestExpense.amount}`} subtitle={largestExpense.name}/>
                    <DashboardBlock title={"Average Spending"} amount={`$${averageExpenseCost.toFixed(2)}`} />
                    <DashboardBlock title={"Total Spent"} amount={`$${total.toFixed(2)}`}/>
                    <DashboardBlock title={"Top Category"} amount={`$${highestCategory[1].toFixed(2)}`} subtitle={highestCategory[0]}/>
                </div>
            ) : (
                <p>No expenses available...</p>
            )}
            <DashboardPieChart data={pieChartData} total={total}/>
        </div>
    );
}

export default Dashboard;