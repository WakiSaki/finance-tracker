import { useState, useEffect } from 'react'
import Expenses from './Expenses.jsx'
import AddExpense from './AddExpense.jsx'
import Dashboard from './Dashboard.jsx'

function App() {
  const [expenses, setExpenses] = useState([]); // Track expenses using states
  const [total, setTotal] = useState(0);  // Track total of expense amounts using states
  const [categories, setCategories] = useState([]); // Track what categories are currently in use

  useEffect(() => {
        fetch("http://localhost:3000/expenses") // Fetch the list of expenses from the backend
            .then((response) => response.json())  // Convert the response to JSON
            .then((data) => { // Update the expenses state with the fetched data
                setExpenses(data);
            });
    }, []);

  useEffect(() => {
    fetch("http://localhost:3000/expenses/total") // Fetch the total amount from the backend
      .then(response => response.json())  // Convert the response to JSON
      .then(data => { // Update the total state with the fetched data
        setTotal(data.total);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/categories") // Fetch the categories that are currently present in expenses
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);  // Update the category state with the fetched data
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-[url('/forest-background.jpg')]
                    bg-cover bg-center bg-fixed
                    py-4"
    >
      <div className="absolute inset-0 bg-black/40"></div>  
      <div className="relative z-10">
        <Dashboard />
        {/* <Expenses expenses={expenses} total={total} categories={categories}
                  setExpenses={setExpenses} setTotal={setTotal}/> */}
        <AddExpense expenses={expenses} categories={categories} setExpenses={setExpenses} setTotal={setTotal} />
      </div>
    </div>
  )
}

export default App
