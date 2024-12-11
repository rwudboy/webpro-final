import React, { useState, useEffect } from 'react';
import { database, auth } from '../../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userEmail = user.email;
      setUserName(userEmail.split('@')[0]); // Set user name without @

      const expensesRef = ref(database, `users/${user.uid}/expenses`);
      onValue(expensesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const expenseList = Object.entries(data).map(([id, values]) => ({ id, ...values }));
          setExpenses(expenseList);
          
          const total = expenseList.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
          setTotalExpenses(total);

          const catTotals = expenseList.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
            return acc;
          }, {});
          setCategoryTotals(catTotals);

          // Process data for monthly chart
          const monthlyExpenses = {};
          expenseList.forEach(expense => {
            const date = new Date(expense.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (!monthlyExpenses[monthYear]) {
              monthlyExpenses[monthYear] = 0;
            }
            monthlyExpenses[monthYear] += parseFloat(expense.amount);
          });

          const chartData = Object.entries(monthlyExpenses).map(([date, total]) => ({
            date,
            total
          }));
          setMonthlyData(chartData);
        } else {
          setExpenses([]);
          setTotalExpenses(0);
          setCategoryTotals({});
          setMonthlyData([]);
        }
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {userName}!</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Monthly Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Expense Summary</h2>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-bold mb-2">Total Expenses</h3>
            <p className="text-4xl font-bold text-blue-600">${totalExpenses.toFixed(2)}</p>
          </div>

          <h3 className="text-xl font-bold mb-4">Top Categories</h3>
          <div className="bg-white p-6 rounded-lg shadow-md">
            {Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([category, total]) => (
                <div key={category} className="flex justify-between border-b py-2">
                  <span>{category}</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Expenses</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            {expenses
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 3)
              .map((expense) => (
                <div key={expense.id} className="border-b py-2">
                  <p className="font-bold">{expense.category}</p>
                  <p>${parseFloat(expense.amount).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{expense.date}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

