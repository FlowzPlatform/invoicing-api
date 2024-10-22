
let e = 1;

module.exports = {

  credentials: {
    'userAgent': 'Xero Sample App - Krishna',
    'consumerKey': process.env.consumerKey,
    'consumerSecret': process.env.consumerSecret,
    'privateKeyPath': './src/services/privatekey.pem'
  },
  qbcredentials: {
    'api_uri': 'https://sandbox-quickbooks.api.intuit.com/v3/company/',
    'tokenUrl': 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    'refresh_token': 'L011522583644PKRYmgRlWvSfjzqdcovXHuArydk4eON6hUtfF',
    'client_id': process.env.client_id,
    'client_secret': process.env.client_secret,
    'realmId': '193514591409719'
  },
  emailConfig: {
    // 'emailUrl':  'https://api.'+process.env.domainkey+'/vmailmicro/sendEmail',
    'emailUrl': 'https://api.' + process.env.domainKey + '/vmailmicro/sendemaildata',
  }
};
