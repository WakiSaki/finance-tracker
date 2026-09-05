import { useState, useEffect, useRef } from 'react';
import OptionMenu from './expenseList_components/OptionMenu';
import ModifyMenu from './expenseList_components/ModifyMenu';
import AlertMessage from './AlertMessage';
import FilterOptions from './expenseList_components/FilterOptions';

function Expenses({ expenses, total, categories, setExpenses, setTotal }) {
    const [selectedExpense, setSelectedExpense] = useState(null); // Track the expenses being displayed
    const [showModify, setShowModify] = useState(false);    // Track whether the modify screen should be displayed or not
    const [successModify, setSuccessModify] = useState(false);  // Track whether to show successful modification alert or not
    const [categoryFilter, setCategoryFilter] = useState("All");    // Track which category to display on the UI
    const [sortOption, setSortOption] = useState("amount high");    // Track what sorting option is currently selected

    const categoryList = ["All", ...categories.map(category => category.name)];  // Track what categories exist among expenses
    const filteredExpenses = categoryFilter === "All"   // Filter expenses by category if the category selected is not "All"
        ? expenses
        : expenses.filter(expense => expense.category === categoryFilter)

    // Sort the expenses based on which option is selected
    const sortFunctions = {
        "amount high": (a, b) => b.amount - a.amount,
        "amount low": (a, b) => a.amount - b.amount,
        "date recent": (a, b) => new Date(b.date) - new Date(a.date),
        "date oldest": (a, b) => new Date(a.date) - new Date(b.date),
        "a-z": (a, b) => a.name.localeCompare(b.name),
        "z-a": (a, b) => b.name.localeCompare(a.name)
    };

    const sortedExpenses = [...filteredExpenses];

    if(sortFunctions[sortOption]) {
        sortedExpenses.sort(sortFunctions[sortOption]);
    }

    // Format date into 'Month. Day, Year'
    function formatExpenseDate(dateString) {
        const [year, month, day] = dateString.split("-").map(Number);
        const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

        let monthName = months[month - 1];

        function getOrdinal(day) {
            if (day >= 11 && day <= 13) {
                return `${day}th`;
            }

            switch (day % 10) {
                case 1:
                    return `${day}st`
                case 2:
                    return `${day}nd`
                case 3:
                    return `${day}rd`
                default:
                    return `${day}th`
            }
        }

        let newDate = `${monthName} ${getOrdinal(day)} ${year}`

        return newDate;
    }

    return (
        <div className="bg-sky-50 my-4 p-4 w-6/7 justify-self-center
                        rounded-lg"
        >
            {showModify && (
                <ModifyMenu categories={categories} selectedExpense={selectedExpense} setShowModify={setShowModify} setExpenses={setExpenses} setTotal={setTotal} setSuccessModify={setSuccessModify}/>
            )}
            {/* Display a success message if the expense was successfully modified */}
            {successModify && (
                <AlertMessage message="Expense updated!" type="good" />
            )}
            <h1 className="text-3xl font-bold text-center m-4">
                Expenses
            </h1>
            <FilterOptions categories={categories} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                           sortOption={sortOption} setSortOption={setSortOption} setSelectedExpense={setSelectedExpense} />
            <div className="relative z-10 border-2 border-black w-2/3 justify-self-center
                            grid grid-cols-4 m-2 bg-white"
            >
                <p className="font-bold text-center border border-gray-400">Expense Name</p>
                <p className="font-bold text-center border border-gray-400">Date</p>
                <p className="font-bold text-center border border-gray-400">Category</p>
                <p className="font-bold text-center border border-gray-400">Amount</p>
                {sortedExpenses.map(expense => (
                    // Expense row that displays the expense name, category, and amount. When clicked, it sets the selected expense and shows the popup.
                    <div onClick={() => { 
                            setSelectedExpense(expense);
                        }}   // Updates selectedExpense and shows the popup when an expense is clicked
                        key={expense.id}
                        className={`relative z-20 grid grid-cols-4 col-span-4 min-h-16
                                hover:bg-gray-200 hover:cursor-pointer
                                border border-stone-600
                                ${selectedExpense?.id === expense.id ? "bg-gray-200" : ""}`}
                    >
                        <p className="text-center p-2 h-full flex items-center justify-center">
                            {expense.name}
                        </p>
                        <p className="text-center p-2 h-full flex items-center justify-center">
                            {formatExpenseDate(expense.date)}
                        </p>
                        <p className="text-center p-2 h-full flex items-center justify-center">
                            {expense.category}
                        </p>
                        <p className="text-center p-2 h-full flex items-center justify-center">
                            ${expense.amount.toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
            <OptionMenu selectedExpense={selectedExpense} setSelectedExpense={setSelectedExpense} 
                        setExpenses={setExpenses} setTotal={setTotal} setShowModify={setShowModify}/>
        </div>
    )
}

export default Expenses;