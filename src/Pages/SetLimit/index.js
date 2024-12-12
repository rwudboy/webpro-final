import React, { useState, useEffect } from 'react';
import { database, auth } from '../../firebaseConfig';
import { ref, set, onValue } from 'firebase/database';

const SetLimit = () => {
  const [limit, setLimit] = useState('');
  const [currentLimit, setCurrentLimit] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); 

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const limitRef = ref(database, `users/${user.uid}/limits/${selectedYear}/${selectedMonth}`);
      onValue(limitRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCurrentLimit(data);
        } else {
          setCurrentLimit(null); 
        }
      });
    }
  }, [selectedMonth, selectedYear]); 

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      const limitRef = ref(database, `users/${user.uid}/limits/${selectedYear}/${selectedMonth}`);
      set(limitRef, parseFloat(limit)); 
      setLimit('');
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Set Spending Limit</h1>
      
     
      {currentLimit !== null && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">Current Limit for {selectedMonth}/{selectedYear}</h2>
          <p className="text-2xl text-blue-600">
  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(currentLimit)}
</p>

        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-center space-x-4">
       
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="border p-2 rounded"
          >
            <option value={1}>January</option>
            <option value={2}>February</option>
            <option value={3}>March</option>
            <option value={4}>April</option>
            <option value={5}>May</option>
            <option value={6}>June</option>
            <option value={7}>July</option>
            <option value={8}>August</option>
            <option value={9}>September</option>
            <option value={10}>October</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>

       
          <input
            type="number"
            value={selectedYear}
            onChange={handleYearChange}
            className="border p-2 rounded"
            min="2020"
          />

         
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="Masukkan Target Uang Yang Ingin Dikeluarkan Perbulan"
            className="border p-2 rounded"
            required
          />

        
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Set Target Bulanan
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetLimit;
