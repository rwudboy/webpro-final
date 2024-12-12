import React, { useState, useEffect } from 'react';
import { database, auth } from '../../firebaseConfig';
import { ref, onValue } from 'firebase/database';

const Summary = () => {
  const [expenses, setExpenses] = useState([]);
  const [limit, setLimit] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [remainingBudget, setRemainingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

  // Format angka ke IDR (Rupiah)
  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  // Mengambil bulan dan tahun dari string tanggal
  const getMonthYear = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth()}-${date.getFullYear()}`;
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const expensesRef = ref(database, `users/${user.uid}/expenses`);
      const limitRef = ref(database, `users/${user.uid}/limits/${selectedYear}/${selectedMonth}`);

      onValue(expensesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const expenseList = Object.values(data).filter((expense) => {
            const expenseMonthYear = getMonthYear(expense.date);
            const selectedMonthYear = `${selectedMonth}-${selectedYear}`;
            return expenseMonthYear === selectedMonthYear;
          });
          setExpenses(expenseList);

          // Menghitung total pengeluaran bulan ini
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
  }, [selectedMonth, selectedYear]); // Re-fetch data when month or year changes

  useEffect(() => {
    if (limit !== null && totalExpenses !== null) {
      setRemainingBudget(limit - totalExpenses);
    }
  }, [limit, totalExpenses]);

  useEffect(() => {
    if (remainingBudget !== null) {
      generateFeedback(remainingBudget);
    }
  }, [remainingBudget]);

  const generateFeedback = async (remainingBudget) => {
    const isPositive = remainingBudget >= 0;
    const formattedAmount = formatIDR(remainingBudget);
    const formattedLimit = limit !== null ? formatIDR(limit) : 'Belum diatur';

    let promptText;
    if (isPositive) {
      promptText = `Anggap kamu adalah seorang teman. Sisa duit teman kamu adalah ${formattedAmount} dari uang perbulannya yaitu ${formattedLimit}. Berikan pujian untuk temanmu dikarenakan teman kamu sudah bisa mengorganisasikan keuangan dengan baik. Pastikan untuk menyebutkan jumlah sisa duit teman kamu.`;
    } else {
      promptText = `Anggap kamu adalah seorang teman, Teman kamu telah melakukan overbudget sejumlah ${formattedAmount}. Berikan roasting maksimal yang membuat orang ini sadar akan situasinya. Pastikan untuk menyebutkan jumlah sisa duit dalam hasil roasting. Dan jangan lupa kasih kata-kata untuk perbaikan ke depannya agar tidak overbudget.`;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDc1oTh3DctGrMJL9f-VG5HYgZF1A4M3Gw`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptText,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from Gemini API:', errorData);
        setFeedback('Error generating feedback. Please try again later.');
        return;
      }

      const data = await response.json();
      if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        setFeedback(data.candidates[0].content.parts[0].text);
      } else {
        setFeedback('Unable to generate feedback at this time.');
      }
    } catch (error) {
      console.error('Error fetching feedback from Gemini:', error);
      setFeedback('Error generating feedback.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Financial Summary</h1>

      {/* Dropdown untuk memilih bulan dan tahun */}
      <div className="mb-4 flex space-x-4">
        <div>
          <label className="mr-2">Pilih Bulan: </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border p-2 rounded"
          >
            {[...Array(12)].map((_, index) => (
              <option key={index} value={index}>
                {new Date(0, index).toLocaleString('id-ID', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2">Pilih Tahun: </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border p-2 rounded"
          >
            {[...Array(5)].map((_, index) => (
              <option key={index} value={new Date().getFullYear() - (4 - index)}>
                {new Date().getFullYear() - (4 - index)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Total Expenses</h2>
          <p className="text-2xl text-blue-600">{formatIDR(totalExpenses)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Spending Limit</h2>
          <p className="text-2xl text-green-600">
            {limit !== null ? formatIDR(limit) : 'Not set'}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Remaining Budget</h2>
          <p className={`text-2xl ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {remainingBudget !== null ? formatIDR(remainingBudget) : 'N/A'}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Expenses</h2>
        {expenses.slice(0, 5).map((expense, index) => (
          <div key={index} className="flex justify-between border-b py-2">
            <span>{expense.category}</span>
            <span className="font-bold">{formatIDR(parseFloat(expense.amount))}</span>
          </div>
        ))}
      </div>

      {/* Display the feedback below the expenses */}
      {remainingBudget !== null && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Budget Feedback</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>{feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
