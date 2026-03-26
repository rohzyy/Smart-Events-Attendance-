require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoute = require('./routes/authRoute');

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/events', require('./routes/eventRoute'));
app.use('/api/participation', require('./routes/participationRoute'));
app.use('/api/location', require('./routes/locationRoute'));

const startCronJobs = require('./services/cronJobs');
startCronJobs();

app.get('/', (req, res) => {
  res.send('Smart OD Management API is running');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
