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

console.log(PLAID);

const plaidClient = new PLAID.PlaidApi({
    clientID: "65301fbca34480001b50a4a8",
    secret: "fbfcfcf691aace4753f9e9dba2a207",
    env: "sandbox",
});

app.get('/create-link-token', async (req, res) => {
    const requestPayload = {
        client_id: "65301fbca34480001b50a4a8",
        secret: "fbfcfcf691aace4753f9e9dba2a207",
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


app.post('/token-exchange', async (req, res) => {  // Fixed the route by adding /
    const { publicToken } = req.body;
    const { access_token: access_token } = await plaidClient.exchangePublicToken(publicToken);

    const authResponse = await plaidClient.getAuth(access_token);
    console.log('--------------------');
    console.log('Auth Response');
    console.log(util.inspect(authResponse, false, null,true));

    const identityResponse = await plaidClient.getIdentity(access_token);
    console.log('--------------------');
    console.log('Identity Response');
    console.log(util.inspect(identityResponse, false, null,true));

    const balanceResponse = await plaidClient.getBalance(access_token);
    console.log('--------------------');
    console.log('Balance Response');
    console.log(util.inspect(balanceResponse, false, null,true));

    res.sendStatus(200);
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
