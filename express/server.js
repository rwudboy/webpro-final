const express = require('express');
const cors = require('cors');
const firebaseAdmin = require('firebase-admin');

const app = express();
const port = 80;

// Firebase initialization
const serviceAccount = require('./firebaseServiceAccountKey.json');
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://wspend-1948f-default-rtdb.asia-southeast1.firebasedatabase.app/',
});

// Enable CORS for your frontend
const corsOptions = {
  origin: 'http://localhost:3000', // Your frontend React app URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,  // Allow credentials (cookies, sessions)
};
app.use(cors(corsOptions));

// API route to export expenses as formatted text
app.get('/api/export-expenses', async (req, res) => {
  const { month, year, userId } = req.query;

  if (!month || !year || !userId) {
    return res.status(400).json({ error: 'Please provide month, year, and userId' });
  }

  try {
    const expensesRef = firebaseAdmin.database().ref(`users/${userId}/expenses`);
    const snapshot = await expensesRef.once('value');
    const expensesData = snapshot.val();

    if (!expensesData) {
      return res.status(404).json({ error: 'No expenses found for this user.' });
    }

    const filteredExpenses = Object.values(expensesData).filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === parseInt(month, 10) && expenseDate.getFullYear() === parseInt(year, 10);
    });

    if (filteredExpenses.length === 0) {
      return res.status(404).json({ error: 'No expenses found for the selected month and year.' });
    }

    // Format the expenses as plain text
    let formattedText = `Expense Report for ${parseInt(month) + 1}/${year}\n\n`;
    formattedText += 'Category           | Amount       | Date\n';
    formattedText += '--------------------------------------------\n';

    filteredExpenses.forEach(expense => {
      formattedText += `${expense.category.padEnd(18)} | ${parseFloat(expense.amount).toLocaleString().padEnd(12)} | ${new Date(expense.date).toLocaleDateString()}\n`;
    });

    // Set response headers for text download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses_report.txt');
    
    // Send the formatted text as response
    res.send(formattedText);

  } catch (error) {
    console.error('Error exporting expenses:', error);
    res.status(500).json({ error: 'An error occurred while exporting expenses.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
