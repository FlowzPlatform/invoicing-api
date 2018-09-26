
module.exports = 
{
  apiUrl : "http://api."+ process.env.domainKey +"/payment",
  credentials : {

    "stripe" : {
      "body_option" : {
        "gateway":"stripe",
        "amount" : 50,
        "currency":"usd",
        "cardNumber": "",
        "expMonth":"",
        "expYear":"",
        "cvc": "",
        "description":"this is desc",
        "isCustomer":false
      },
      "headers": {
        "content-type": "application/json",
        "x-api-token": "",
        "cache-control": "no-cache"
      }
    },

    "auth" : {
      "body_option" : {
        "gateway":"authdotnet",
        "amount": 51,
        "cardNumber":"",
        "expMonth":"",
        "expYear":"",
        "cvc":"",
        "isCustomer":false
      },

      "headers" : {
        "content-type": "application/json",
        "X-api-token" : "",
        "x-api-login" :  "",
        "cache-control": "no-cache"
      }
    },

    "paypal" : {

      "body_option" : {
        "gateway":"paypal",
        "intent": "sale",
        "payer": {
          "payment_method": "credit_card",
          "funding_instruments": [{
            "payment_card": {
              "type":"",
              "number": "",
              "expire_month":"",
              "expire_year": "",
              "cvv2": "",
              "billing_country": "US"
            }
            }]
          },
          "transactions": [{
            "amount": {
              "total": 51,
              "currency": "USD",
              "details": {
                "subtotal": 51,
                "tax": "0",
                "shipping": "0"
              }
            },
            "description": "This is the payment transaction description"
            }]
          },

          "headers": {
            "content-type" : "application/json",
            "X-api-token" : "",
            "x-api-login" :  "",
            "cache-control" : "no-cache"
          }
        }
  }

};
