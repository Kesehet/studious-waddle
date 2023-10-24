// Imports
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const util = require('util');
const PLAID = require('plaid');
require('dotenv').config();

// Constants
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = "65301fcba34480001b50a4a8";
const SECRET = "fbfcfcf691aace4753f9e9db2aa207";
const API_ENDPOINT = "https://sandbox.plaid.com";
const plaidClient = new PLAID.PlaidApi({
    clientID: CLIENT_ID,
    secret: SECRET,
    env: "sandbox",
});

// Middleware
app.use(bodyParser.json());

// Helper Functions
const sendPostRequest = async (url, data) => {
    try {
        const response = await axios.post(url, data, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error(error.response ? error.response.data : error);
        throw error;
    }
};

const logResponse = (title, data) => {
    console.log('--------------------');
    console.log(title);
    console.log(util.inspect(data, false, null, true));
};

// Route Handlers
app.get('/create-link-token', async (req, res) => {
    const requestPayload = {
        client_id: CLIENT_ID,
        secret: SECRET,
        user: { client_user_id: "My User ID" },
        client_name: "My Client Name",
        products: ["auth", "identity"],
        country_codes: ["US"],
        language: "en",
    };

    try {
        const { link_token } = await sendPostRequest(`${API_ENDPOINT}/link/token/create`, requestPayload);
        res.json({ link_token });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

app.post('/token-exchange', async (req, res) => {
    const { public_token } = req.body;
    const commonPayload = {
        client_id: CLIENT_ID,
        secret: SECRET,
    };

    try {
        const { access_token, item_id } = await sendPostRequest(`${API_ENDPOINT}/item/public_token/exchange`, {
            ...commonPayload,
            public_token,
        });

        const authResponse = await sendPostRequest(`${API_ENDPOINT}/auth/get`, {
            ...commonPayload,
            access_token,
        });
        logResponse('Auth Response', authResponse);

        const identityResponse = await sendPostRequest(`${API_ENDPOINT}/identity/get`, {
            ...commonPayload,
            access_token,
        });
        logResponse('Identity Response', identityResponse);

        const balanceResponse = await sendPostRequest(`${API_ENDPOINT}/accounts/balance/get`, {
            ...commonPayload,
            access_token,
        });
        logResponse('Balance Response', balanceResponse);

        res.sendStatus(200);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Server Startup
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
