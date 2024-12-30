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
  const [feedbackGenerated, setFeedbackGenerated] = useState(false); // Track whether feedback was generated

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
      const limitRef = ref(database, `users/${user.uid}/limits/${selectedYear}/${selectedMonth + 1}`);

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
        } else {
          setLimit(0); // Set to 0 if no limit is found
        }
      });
    }
  }, [selectedMonth, selectedYear]); // Re-fetch data when month or year changes

  useEffect(() => {
    if (limit !== null && totalExpenses !== null) {
      setRemainingBudget(limit - totalExpenses);
    }
  }, [limit, totalExpenses]);

  const generateFeedback = async (remainingBudget) => {
    const apiUrl = `http://127.0.0.1:8000/api/generate-feedback?remainingBudget=${remainingBudget}&limit=${limit}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from local API:', errorData);
        setFeedback('Error generating feedback. Please try again later.');
        return;
      }

      const data = await response.json();
      if (data && data.feedback) {
        setFeedback(data.feedback);
      } else {
        setFeedback('Unable to generate feedback at this time.');
      }
    } catch (error) {
      console.error('Error fetching feedback from local API:', error);
      setFeedback('Error generating feedback.');
    }
  };

  const handleGenerateFeedback = () => {
    if (remainingBudget !== null) {
      generateFeedback(remainingBudget);
      setFeedbackGenerated(true);
    }
  };

  // Function to handle Export to Text (TXT) from CSV response
  const handleExportText = async () => {
    const user = auth.currentUser; // Get the current user from Firebase authentication
  
    if (!user) {
      console.error('User is not logged in');
      return;
    }
  
    const userId = user.uid; // Get the user ID
    const apiUrl = `http://localhost:80/api/export-expenses?month=${selectedMonth}&year=${selectedYear}&userId=${userId}`; // Corrected the month by adding 1 to match the API format
  
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
  
      // Handle the response (formatted text data)
      const textData = await response.text(); // Read the response as plain text
      const filename = `expenses_report_${selectedMonth + 1}-${selectedYear}.txt`;
  
      // Create a Blob from the plain text data
      const blob = new Blob([textData], { type: 'text/plain' });
      const link = document.createElement('a'); // Create an anchor tag to trigger download
      link.href = URL.createObjectURL(blob); // Create a URL for the Blob
      link.download = filename; // Set the download file name
      link.click(); // Trigger the download
  
    } catch (error) {
      console.error('Error exporting expenses:', error);
      alert('An error occurred while exporting expenses.');
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
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
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
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
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

      {/* Button to generate feedback */}
      <div className="mt-8">
        <button
          onClick={handleGenerateFeedback}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          {feedbackGenerated ? 'Feedback Generated' : 'Generate Feedback'}
        </button>
      </div>

      {/* Export to Excel Button */}
      <div className="mt-4">
        <button
          onClick={handleExportText}
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
        >
          Export Report
        </button>
      </div>

      {/* Display the feedback below the button */}
      {feedback && (
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
