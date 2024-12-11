import React, { useState, useEffect } from 'react';
import { database, auth } from '../../firebaseConfig';
import { ref, set, onValue } from 'firebase/database';

const SetLimit = () => {
  const [limit, setLimit] = useState('');
  const [currentLimit, setCurrentLimit] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const limitRef = ref(database, `users/${user.uid}/limit`);
      onValue(limitRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCurrentLimit(data);
        }
      });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      const limitRef = ref(database, `users/${user.uid}/limit`);
      set(limitRef, parseFloat(limit));
      setLimit('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Set Spending Limit</h1>
      {currentLimit && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">Current Limit</h2>
          <p className="text-2xl text-blue-600">${currentLimit.toFixed(2)}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-center">
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="Enter new limit"
            className="border p-2 rounded mr-2"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Set Limit
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetLimit;

