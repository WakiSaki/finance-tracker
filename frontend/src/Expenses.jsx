import { useState, useEffect, useRef } from 'react';
import OptionMenu from './OptionMenu';
import ModifyMenu from './ModifyMenu';

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
    const sortedExpenses = [...filteredExpenses];
    if(sortOption === "amount high") {  // Sort from highest to lowest amount
        sortedExpenses.sort((a,b) => b.amount - a.amount);
    }
    if(sortOption === "amount low") {   // Sort from lowest to highest amount
        sortedExpenses.sort((a,b) => a.amount - b.amount);
    }
    if(sortOption === "date recent") {  // Sort from most recent to oldest
        sortedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    if(sortOption === "date oldest") {  // Sort from oldest to most recent
        sortedExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    if(sortOption === "a-z") {  // Sort from A-Z
        sortedExpenses.sort((a,b) => a.name.localeCompare(b.name));
    }
    if(sortOption === "z-a") {  // Sort from Z-A
        sortedExpenses.sort((a,b) => b.name.localeCompare(a.name));
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
            <p className={`bg-green-500 p-2 rounded shadow-lg
                            fixed top-5 right-5
                            text-white text-center
                            transition-opacity duration-500
                            ${successModify ? 'opacity-100' : 'opacity-0'}`}
            >
                Expense updated!
            </p>
            <h1 className="text-3xl font-bold text-center m-4">
                Expenses
            </h1>
            <div className="bg-white max-w-fit justify-self-center px-4
                            rounded-lg border border-black flex gap-4
                            items-center
                            sm:flex-col lg:flex-row"
            >
                {/* Category Selector */}
                <span className="flex flex-col justify-self-center gap-2 py-2 h-full">
                    <label>Category:</label>
                    <select value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setSelectedExpense(null);
                            }}
                            className="bg-indigo-50 rounded-lg border border-black"
                    >
                        {categoryList.map(category => (
                            <option key={category.id} value={category.name}
                                    className="text-right"
                            >
                                {category}
                            </option>
                        ))}
                    </select>
                </span>
                {/* Sorting Options */}
                <span className="flex flex-col gap-2 py-2 justify-self-center h-full">
                    <label>Sort by:</label>
                    <select value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="bg-indigo-50 rounded-lg border border-black"
                    >
                        <option className="text-end" value="amount high">Amount (High to Low)</option>
                        <option className="text-end" value="amount low">Amount: (Low to High)</option>
                        <option className="text-end" value="date recent">Date (Most Recent)</option>
                        <option className="text-end" value="date oldest">Date (Oldest)</option>
                        <option className="text-end" value="a-z">Alphabetical (A-Z)</option>
                        <option className="text-end" value="z-a">Alphabetical (Z-A)</option>
                    </select>
                </span>
            </div>
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