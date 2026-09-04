import { useState } from 'react'
import AlertMessage from '../AlertMessage';

function OptionMenu({ selectedExpense, setSelectedExpense, setExpenses, setTotal, setShowModify }) {
    const [successDelete, setSuccessDelete] = useState(false);  // Track whether a deletion was successful or not

    // Handle deletion when the delete button is pressed
    const handleDelete = async () => {
        if (selectedExpense) {  // Check if an expense has been selected from the expense list
            try {
                const response = await fetch(`http://localhost:3000/expenses/${selectedExpense.id}`, {
                    method: 'DELETE',
                }); // DELETE request made to the backend using the selectedExpense ID

                // Only updates the frontend if the backend confirms the deletion of the expense
                if(response.ok) {
                    console.log(`Expense with ID ${selectedExpense.id} deleted successfully.`);
                    setSuccessDelete(true); // Set the successful delete to true
                    setTimeout(() => setSuccessDelete(false), 3000);    // Reset the successful delete after 3 seconds

                    // Remove the deleted expense from the local expense list to update UI
                    setExpenses(prevExpenses =>
                        prevExpenses.filter(
                            expense => expense.id !== selectedExpense.id
                        )
                    );

                    //Set the currently selected expense back to null (i.e. none)
                    setSelectedExpense(null);

                    // Update the displayed total from the backend response
                    const totalResponse = await fetch("http://localhost:3000/expenses/total");  // Fetch the updated total from the backend
                    const totalData = await totalResponse.json();   // Convert the response to JSON object
                    setTotal(totalData.total);
                }
                else {
                    console.error(`Failed to delete expense with ID ${selectedExpense.id}.`);
                }
            } catch (error) {
                console.error(error);
            }
        }
        else {
            return;
        }
    };

    return (
        <div className="mb-8">
            <p className="text-lg font-semibold text-center">Currently selected item:</p>
            <p className="text-center">{selectedExpense === null ? "None" : selectedExpense?.name}</p>
            <div className="justify-self-center flex gap-4
                            p-4"
            >
                <button className="border-2 border-cyan-700 px-3 rounded-lg
                                hover:bg-cyan-700 hover:text-white hover:cursor-pointer
                                transition-colors duration-200"
                        onClick={() =>{
                            if (selectedExpense !== null) {
                                setShowModify(true);
                            } else {
                                alert("Select an expense first!")
                            }
                        }}
                >
                    Modify
                </button>
                <button className="border-2 border-red-600 px-3 rounded-lg
                                hover:bg-red-600 hover:text-white hover:cursor-pointer
                                transition-colors duration-200"
                        onClick={handleDelete}
                >
                    Delete
                </button>
                {/* Displays a success message if the expense was successfully deleted */}
                {successDelete && (
                    <AlertMessage message="Successfully deleted!" type="good" />
                )}
            </div>
        </div>
    )
}

export default OptionMenu;