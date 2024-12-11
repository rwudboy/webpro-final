import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from "../Dashboard";
import LogExpense from "../LogExpense";
import Report from "../Report";
import Summary from "../Summary";
import SetLimit from "../SetLimit";
import Sidebar from "../../components/sidebar";
import Navbar from "../../components/navbar";
import "../../index.css"
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import Login from "../Login";
import Register from "../Register";

function LayoutPage() {
    const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar />}
        <div className="flex">
          {user && <Sidebar />}
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
              <Route
                path="/"
                element={user ? <Dashboard /> : <Navigate to="/login" />}
              />
              <Route
                path="/set-limit"
                element={user ? <SetLimit /> : <Navigate to="/login" />}
              />
              <Route
                path="/log-expense"
                element={user ? <LogExpense /> : <Navigate to="/login" />}
              />
              <Route
                path="/report"
                element={user ? <Report /> : <Navigate to="/login" />}
              />
              <Route
                path="/summary"
                element={user ? <Summary /> : <Navigate to="/login" />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default LayoutPage;
