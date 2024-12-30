import React, { useState, useEffect } from 'react';
import { database, auth } from '../../firebaseConfig';
import { ref, push, onValue, remove } from 'firebase/database';

const LogExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ amount: '', category: '', date: '' });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const expensesRef = ref(database, `users/${user.uid}/expenses`);
      onValue(expensesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const expenseList = Object.entries(data).map(([id, values]) => ({ id, ...values }));
          setExpenses(expenseList);
        } else {
          setExpenses([]);
        }
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      const expensesRef = ref(database, `users/${user.uid}/expenses`);
      push(expensesRef, newExpense);
      setNewExpense({ amount: '', category: '', date: '' });
    }
  };

  const handleDelete = (id) => {
    const user = auth.currentUser;
    if (user) {
      const expenseRef = ref(database, `users/${user.uid}/expenses/${id}`);
      remove(expenseRef);
    }
  };



  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Log Expense</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            name="amount"
            value={newExpense.amount}
            onChange={handleInputChange}
            placeholder="Jumlah Pengeluaran"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="category"
            value={newExpense.category}
            onChange={handleInputChange}
            placeholder="Kategori"
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            name="date"
            value={newExpense.date}
            onChange={handleInputChange}
            className="border p-2 rounded"
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Tambah Pengeluaran
        </button>
      </form>
      <div>
        <h2 className="text-2xl font-bold mb-4">Expense List</h2>
        {expenses.map((expense) => (
         <div key={expense.id} className="border p-4 mb-4 rounded">
         <p>Jumlah: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(parseFloat(expense.amount))}</p>
         <p>Kategori: {expense.category}</p>
         <p>Tanggal: {expense.date}</p>
         <button
           onClick={() => handleDelete(expense.id)}
           className="bg-red-500 text-white px-2 py-1 rounded mr-2"
         >
           Delete
         </button>
       </div>
       
        ))}
      </div>
    </div>
  );
};

export default LogExpense;

