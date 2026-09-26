import { useState } from 'react';
import AlertMessage from './AlertMessage.jsx';

const categories = ['Utilities', 'Food', 'Transportation', 'Other', 'Shopping'];
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function BudgetCategories() {
  const [budgetDraft, setBudgetDraft] = useState({});
  const [budgets, setBudgets] = useState({});
  const [successMessageId, setSuccessMessageId] = useState(0);

  function updateBudget(category, value) {
    setBudgetDraft((currentBudgets) => ({
      ...currentBudgets,
      [category]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault(); // Stop the page from reloading

    setBudgets(
      Object.fromEntries(
        categories.map((category) => [category, Number(budgetDraft[category] || 0)]),
      ),
    );
    setSuccessMessageId((currentId) => currentId + 1);  // Show a success message if the changes were successfully made
  }

  return (
    <section className="mx-auto max-w-4xl rounded-lg bg-stone-200 p-8" aria-labelledby="budget-categories-title">
      <h1 id="budget-categories-title" className="mb-6 text-center text-2xl font-bold">
        Budget Categories
      </h1>
      <p className="text-center italic my-4">
        Set your category budgets here to track your spending habits
      </p>
      <section className="mb-6 rounded-md bg-white p-4" aria-labelledby="current-budgets-title">
        <h2 id="current-budgets-title" className="mb-3 text-center font-semibold">
          Current Category Budgets
        </h2>
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {categories.map((category) => (
            <div key={category} className="flex justify-between gap-4 border-b border-stone-200 pb-1">
              <dt>{category}</dt>
              <dd className="font-medium">
                {currencyFormatter.format(budgets[category] ?? 0)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <form className="grid grid-cols-1 gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
        {categories.map((category) => {
          const id = `budget-${category.toLowerCase()}`;

          return (
            <div key={category} className="flex items-center gap-4">
              <label htmlFor={id} className="sm:text-right w-3/4">
                {category}
              </label>
              <input
                id={id}
                name={category.toLowerCase()}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={budgetDraft[category] ?? ''}
                onChange={(event) => updateBudget(category, event.target.value)}
                className="rounded border bg-white px-3 py-2 w-full"
              />
            </div>
          );
        })}
        <button type="submit" className="bg-gray-100 hover:bg-green-500 transition-colors duration-300
                           hover:text-white w-fit px-8 py-2 rounded place-self-center col-span-1 sm:col-span-2"
        >
          Submit Changes
        </button>
      </form>
      {successMessageId > 0 && (
        <AlertMessage key={successMessageId} message="Budgets updated." type="good" />
      )}
    </section>
  );
}

export default BudgetCategories;
