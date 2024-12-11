import React,  { useState, useEffect } from 'react';
import { database, auth } from '../../firebaseConfig';
import { ref, onValue } from 'firebase/database';

const Summary = () => {
  const [expenses, setExpenses] = useState([]);
  const [limit, setLimit] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const expensesRef = ref(database, `users/${user.uid}/expenses`);
      const limitRef = ref(database, `users/${user.uid}/limit`);

      onValue(expensesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const expenseList = Object.values(data);
          setExpenses(expenseList);
          const total = expenseList.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
          setTotalExpenses(total);
        } else {
          setExpenses([]);
          setTotalExpenses(0);
        }
      });

      onValue(limitRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setLimit(data);
        }
      });
    }
  }, []);

  const remainingBudget = limit !== null ? limit - totalExpenses : null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Financial Summary</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Total Expenses</h2>
          <p className="text-2xl text-blue-600">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Spending Limit</h2>
          <p className="text-2xl text-green-600">${limit !== null ? limit.toFixed(2) : 'Not set'}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Remaining Budget</h2>
          <p className={`text-2xl ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {remainingBudget !== null ? `$${remainingBudget.toFixed(2)}` : 'N/A'}
          </p>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Expenses</h2>
        {expenses.slice(0, 5).map((expense, index) => (
          <div key={index} className="flex justify-between border-b py-2">
            <span>{expense.category}</span>
            <span className="font-bold">${parseFloat(expense.amount).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Summary;

