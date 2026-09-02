import { useState } from 'react';

function AddExpense({ expenses, categories, setExpenses, setTotal }) {
    const [name, setName] = useState("");   // Track name using states
    const [amount, setAmount] = useState('');    // Track amount using states
    const [category, setCategory] = useState("");   // Track category using states
    const [date, setDate] = useState("");

    const [success, setSuccess] = useState(false); // Track whether an expense addition was successful

    const categoryList = ["None", ...categories.map(category => category.name)];  // Track what categories exist among expenses

    // Handles the POST request
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the browser from doing the default form submission, which reloads the page

        if(!name || !amount || !category || !date) {
            alert("Please fill out all fields.")
            return;
        }

        // Create a new expense object to be added
        const newExpense = {
            name: name,
            amount: parseFloat(amount),
            category: category,
            date: date
        };

        // Attempt to submit an expense to backend
        try {
            // Create a POST request to the backend with the new expense object
            const response = await fetch('http://localhost:3000/api/expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newExpense)
            });

            if(!response.ok) {
                throw new Error(data.message);
            }

            // Update expense list to display new list to UI
            const expenseList = await fetch("http://localhost:3000/expenses");  // Fetches the updated list of expenses from the backend
            const expenseData = await expenseList.json();   // Converts the response to JSON
            setExpenses(expenseData);   // Updates the expenses state in the App component with the new list of expenses

            // Update total to display on UI
            const totalResponse = await fetch("http://localhost:3000/expenses/total");  // Fetches the updated total from the backend
            const totalData = await totalResponse.json();   // Converts the response to JSON
            setTotal(totalData.total);

            setSuccess(true);   // Set the success state to true, which can be used to display a success message
            setTimeout(() => setSuccess(false), 3000);   // Reset the success state to false after 3 seconds, which can be used to hide the success message

            console.log('Expense added');

            // Reset the input fields
            setName("");
            setAmount("");
            setCategory("");
            setDate("");

        } catch (error) {
            console.error('Error adding expense:', error);
        }
    }

    return (
        <div className="justify-self-center rounded-lg
                        p-12 mb-4 bg-stone-200"
        >
            <p className="place-self-center font-bold text-xl mb-8">
                Add a New Expense
            </p>
            <form onSubmit={handleSubmit}   // Run handleSumbit when the submit button is pressed
                  className="grid grid-cols-1 gap-4"
            >
                {/* Expenses Name */}
                <div className="grid grid-cols-2 gap-2">   
                    <label className="text-right self-center">Expense Name</label>
                    <input type="text"
                           value={name}
                           onChange={(e) => setName(e.target.value)}    // Updates name when input is entered
                           className="border rounded px-3 py-1 justify-self-end bg-white"
                    />
                </div>
                {/* Expense Amount */}
                <div className="grid grid-cols-2 gap-2">
                    <label className="text-right self-center">Expense Amount</label>
                    <input type="number" 
                           value={amount}
                           onChange={(e) => setAmount(e.target.value)}
                           className="border rounded px-3 py-1 justify-self-end bg-white"
                    />
                </div>
                {/* Expense Category */}
                <div className="grid grid-cols-2 gap-2">
                    <label className="text-right self-center">Expense Category</label>
                    <select type="text"
                           value={category}
                           onChange={(e) => setCategory(e.target.value)}
                           className="border rounded px-3 py-1 justify-self-end w-full bg-white"
                    >
                        {categoryList.map(category => (
                            <option key={category.id} value={category.name}
                                    className="text-right"
                            >
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <label className="text-right self-center">Expense Amount</label>
                    <input type="date" 
                           value={date}
                           onChange={(e) => setDate(e.target.value)}
                           className="border rounded px-3 py-1 justify-self-end bg-white"
                    />
                </div>

                {/* The submit button */}
                <button type="submit"
                        className="bg-slate-300 outline outline-black
                                   p-2 m-2 rounded-sm place-self-center w-full
                                   hover:bg-green-600 hover:text-white hover:cursor-pointer hover:outline-green-600
                                   transition-all duration-300"
                >
                    Add expense
                </button>
            </form>
            {/* Display a success message if the expense was successfully added */}
            <p className={`bg-emerald-500 p-2 rounded shadow-lg
                            fixed top-5 right-5
                            text-white text-center
                            transition-opacity duration-500
                            ${success ? 'opacity-100' : 'opacity-0'}`}
            >
                Expense added!
            </p>
        </div>
    )
}

export default AddExpense;