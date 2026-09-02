import { useState, useEffect } from 'react'
import Expenses from './Expenses.jsx'
import AddExpense from './AddExpense.jsx'
import OptionMenu from './OptionMenu.jsx'

function App() {
  const [expenses, setExpenses] = useState([]); // Track expenses using states
  const [total, setTotal] = useState(0);  // Track total of expense amounts using states
  const [categories, setCategories] = useState([]);

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
    fetch("http://localhost:3000/categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      });
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold text-center m-4">
          Expenses
      </h1>
      <Expenses expenses={expenses} total={total} categories={categories}
                setExpenses={setExpenses} setTotal={setTotal}/>
      <AddExpense expenses={expenses} categories={categories} setExpenses={setExpenses} setTotal={setTotal} />
    </>
  )
}

export default App
