const express = require('express');
const app = express();
const axios = require('axios');  // Add this line to import axios

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const path = require('path');
const util = require('util');
const PLAID = require('plaid');
require('dotenv').config();


const plaidClient = new PLAID.PlaidApi({
    clientID: "65301fcba34480001b50a4a8",
    secret: "fbfcfcf691aace4753f9e9db2aa207",
    env: "sandbox",
});

app.get('/create-link-token', async (req, res) => {
    const requestPayload = {
        client_id: "65301fcba34480001b50a4a8",
        secret: "fbfcfcf691aace4753f9e9db2aa207",
        user: {
            client_user_id: "My User ID",
        },
        client_name: "My Client Name",
        products: ["auth","identity"],
        country_codes: ["US"],
        language: "en"
    };
    
    try {
        const response = await axios.post('https://sandbox.plaid.com/link/token/create', requestPayload, {
            headers: {
                'Content-Type': 'application/json',
                // Add other necessary headers
            }
        });
        const { link_token } = response.data;
        res.json({ link_token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


app.post('/token-exchange', async (req, res) => {
    const { public_token } = req.body;
    try {
        const response = await axios.post('https://sandbox.plaid.com/item/public_token/exchange', {
            public_token: public_token,
            client_id: "65301fcba34480001b50a4a8",
            secret: "fbfcfcf691aace4753f9e9db2aa207",
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const accessToken = response.data.access_token;
        const itemID = response.data.item_id;

        // Axios call for getAuth
        const authResponse = await axios.post('https://sandbox.plaid.com/auth/get', {
            client_id: "65301fcba34480001b50a4a8",
            secret: "fbfcfcf691aace4753f9e9db2aa207",
            access_token: accessToken
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log('--------------------');
        console.log('Auth Response');
        console.log(util.inspect(authResponse.data, false, null, true));

        // Axios call for getIdentity
        const identityResponse = await axios.post('https://sandbox.plaid.com/identity/get', {
            client_id: "65301fcba34480001b50a4a8",
            secret: "fbfcfcf691aace4753f9e9db2aa207",
            access_token: accessToken
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log('--------------------');
        console.log('Identity Response');
        console.log(util.inspect(identityResponse.data, false, null, true));

        // Axios call for getBalance
        const balanceResponse = await axios.post('https://sandbox.plaid.com/accounts/balance/get', {
            client_id: "65301fcba34480001b50a4a8",
            secret: "fbfcfcf691aace4753f9e9db2aa207",
            access_token: accessToken
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log('--------------------');
        console.log('Balance Response');
        console.log(util.inspect(balanceResponse.data, false, null, true));

        res.sendStatus(200);
    } catch (error) {
        console.error(error.response ? error.response.data : error);
        res.status(500).send('Server Error');
    }
});


app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
