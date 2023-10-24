const express = require('express');
const app = express();



const bodyParser = require('body-parser');
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const path = require('path');
const util = require('util');
const plaid = require('plaid');

// There are 3 environments to choose from Sandbox , Development and Production

const plaidClient = new plaid.Client({
    clientID: process.env.PLAIID_CLIENT_ID,
    secret: process.env.PLAIID_SECRET,
    env: plaid.environments.sandbox
});

app.get('/create-link-token', async (req, res) => {
    const {link_token: link_token } = await plaidClient.createLinkToken({
        user : {
            client_user_id: "My User ID",
        },
        client_name: "My Client Name",
        products: ["auth","identity"],
        country_codes: ["US"],
        language: "en"
    });
    res.json({link_token});
});

app.post('token-exchange', async (req, res) => {
    const {publicToken } = req.body;
    const {access_token: access_token } = await plaidClient.exchangePublicToken(publicToken);

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
})