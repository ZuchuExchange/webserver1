require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON body

const {
  PORT,
  PAYMENT_URL,
  REFERENCE_STATUS_URL,
  AUTH_HEADER,
  CALLBACK_URL
} = process.env;

const authHeader = {
  'Authorization': AUTH_HEADER,
  'Content-Type': 'application/json'
};

// POST /pay
app.post('/pay', async (req, res) => {
  try {
    const { amount, phone_number } = req.body;

    if (!amount || !phone_number) {
      return res.status(400).json({ error: 'Missing amount or phone_number' });
    }

    const payload = {
      amount,
      phone_number,
      channel_id: 6034,
      provider: 'm-pesa',
      external_reference: 'INV-009',
      customer_name: 'Customer',
      callback_url: CALLBACK_URL,
    };

    const response = await axios.post(PAYMENT_URL, payload, { headers: authHeader });
    console.log('Payment gateway response:', response.data);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
      res.status(error.response.status).json({
        error: error.message,
        response: error.response.data,
      });
    } else {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

// GET /reference_status?reference=...
app.get('/reference_status', async (req, res) => {
  const { reference } = req.query;
  if (!reference) {
    return res.status(400).json({ error: 'Missing reference parameter' });
  }
  try {
    const url = `${REFERENCE_STATUS_URL}?reference=${encodeURIComponent(reference)}`;
    const response = await axios.get(url, { headers: authHeader });
    console.log('Reference status response:', response.data);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
      res.status(error.response.status).json({
        error: error.message,
        response: error.response.data,
      });
    } else {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

// Start server
const port = PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
