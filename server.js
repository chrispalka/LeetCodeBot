import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const { PORT } = process.env || 5000;

const app = express();

app.listen(PORT, () => console.log(`Connected at: http://localhost:${PORT}`));
