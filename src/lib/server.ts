import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(express.json());

// Open the SQLite database
const db = await open({
  filename: './mydb.sqlite',
  driver: sqlite3.Database
});

// Example endpoint
app.get('/api/users', async (req, res) => {
  const users = await db.all('SELECT * FROM users');
  res.json(users);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
