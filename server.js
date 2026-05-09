require('dotenv').config();

const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

app.listen(port, () => {
    console.log(`A szerver fut a http://localhost:${port} címen`);
});