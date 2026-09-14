import { useState } from "react";

function ModifyMenu({ categories, selectedExpense, setShowModify, setExpenses, setTotal, setSuccessModify, setDashboardVersion }) {
    // Store the values entered in the modify form
    const [name, setName] = useState(selectedExpense.name);
    const [amount, setAmount] = useState(selectedExpense.amount);
    const [category, setCategory] = useState(selectedExpense.category);
    const [date, setDate] = useState(selectedExpense.date);

    // Update the selected expense when the save button is pressed
    const handleModify = async () => {
        // Store updated expense data for PUT request
        const updatedExpense = {
            name,
            amount,
            category,
            date
        }

        //  Send updated expense data to the backend using selected expense's ID
        const response = await fetch(`http://localhost:3000/expenses/${selectedExpense.id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedExpense)
            }
        );

        const data = await response.json();

        //  Only execute if the expense was successfully updated
        if(response.ok) {
            setShowModify(false);   // Hide modify menu
            setSuccessModify(true); // Show alert message for successful modification
            setTimeout(() => setSuccessModify(false), 4000);    // Hide success alert after 3 seconds

            setExpenses(currentExpenses => currentExpenses.map(expense =>
                expense.id === data.expense.id ? data.expense : expense
            ));
            setTotal(data.total);
            setDashboardVersion(currentVersion => currentVersion + 1);
        } else {
            console.error(data.message || 'Failed to update expense');
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
                <h2 className="font-bold text-cente text-xl mb-4">Modify Expense</h2>
                <div className="flex flex-col">
                    <span className="mb-4 flex">
                        <label className="mr-2 w-full">Expense Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border p-2 w-full"
                        />
                    </span>
                    <span className="mb-4 flex">
                        <label className="mr-2 w-full">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => {
                                const value = e.target.value;
                                setAmount(value === "" ? "" : Number(value));
                            }}
                            className="border p-2 w-full"
                        />
                    </span>
                    <span className="mb-4 flex">
                        <label className="mr-2 w-full">Category</label>
                        <select
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="border p-2 w-full"
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.name}
                                        className="text-right"
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </span>
                    <span className="mb-4 flex">
                        <label className="mr-2 w-full">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border p-2 w-full"
                        />
                    </span>
                </div>
                <span className="flex justify-center align-center gap-4 h-10">
                    <button onClick={handleModify}
                            className="bg-emerald-300 w-full
                                       hover:cursor-pointer hover:bg-emerald-600 hover:text-white
                                       transition-colors duration-300 rounded-lg"
                    >
                        Save
                    </button>
                    <button onClick={() => setShowModify(false)}
                            className="bg-rose-300 w-full
                                       hover:cursor-pointer hover:bg-rose-700 hover:text-white
                                       transition-colors duration-300 rounded-lg"
                    >
                        Cancel
                    </button>
                </span>
            </div>
        </div>
    );
}

export default ModifyMenu;
