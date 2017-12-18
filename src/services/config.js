module.exports = {

    credentials: {
    "userAgent" : "Xero Sample App - Krishna",
    "consumerKey": process.env.consumerKey,
    "consumerSecret": process.env.consumerSecret,
    "privateKeyPath": "./src/services/privatekey.pem"
  },
  qbcredentials: {
    "api_uri": "https://sandbox-quickbooks.api.intuit.com/v3/company/",
    "tokenUrl" : "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    "refresh_token" : "Q011522298808PHj6bzg6giQRpd2cbz2p1nEzcgavkqhcxuO4A",
    "client_id" : process.env.client_id,
    "client_secret" : process.env.client_secret,
    "realmId" : "193514591409719"
  }
  };

