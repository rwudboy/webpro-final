import React, { useState, useEffect } from 'react';
import { database, auth } from '../../firebaseConfig';
import { ref, onValue } from 'firebase/database';

const Report = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const expensesRef = ref(database, `users/${user.uid}/expenses`);
      onValue(expensesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const expenseList = Object.values(data);
          setExpenses(expenseList);
          
          const total = expenseList.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
          setTotalExpenses(total);

          const catTotals = expenseList.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
            return acc;
          }, {});
          setCategoryTotals(catTotals);
        } else {
          setExpenses([]);
          setTotalExpenses(0);
          setCategoryTotals({});
        }
      });
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Total Pengeluaran Sampai Saat Ini</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Total Pengeluaran</h2>
        <p className="text-4xl font-bold text-blue-600">
  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalExpenses)}
</p>

      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Pengeluaran by Kategori</h2>
        {Object.entries(categoryTotals).map(([category, total]) => (
          <div key={category} className="flex justify-between border-b py-2">
            <span>{category}</span>
            <span className="font-bold">
  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total)}
</span>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Report;

