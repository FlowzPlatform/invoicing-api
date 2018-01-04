module.exports = {
    create : {
       "properties": {
           "domain": {
               "type": "string",
               "enum": ["QB", "Xero"]
           },
           "name": {
               "description": "Customer name"
           },
           "qty": {
               "description": "Quantity"
           },
           "description": {
               "description": "Description of product"
           },
           "amount": {
               "description": "Amount of product",
               "type": "number"
           }
       },
       "required": [ ],
        "additionalProperties": true
   },

    delete : {
       "properties": {
           "gateway": {
               "type": "string",
               "enum": ["stripe", "authdotnet"]
           },
           "id": {
               "type": "string"
           }
       },
       "required": ["id", "gateway"],
        "additionalProperties": false
   },

    update : {
       "properties":{
         "gateway": {
             "type": "string",
             "enum": ["stripe", "authdotnet"]
         },
           "customer":{
             "description": "customerid in String",
             "type": "string"
           },
           "description":{
               "description": "Customer description in String",
               "type": "string"
           },
           "email": {
               "description": "email  in String",
               "type": "string"
           }
       },
       "required":["customer","gateway"],
        "additionalProperties": false
    },


    get : {
       "properties": {

        "user" : {
            "type": "string",
            "description":"cursor for use in pagination",
            },
        "gateway": {
            "type": "string",
            "enum": ["stripe", "authdotnet"]
        }
       },
       "required": [],
        "additionalProperties": true
   },


   find : {
     "properties" : {
       "domain" : {
         "type" : "string",
         "enum" : ["QB", "Xero"]
       },
       "chart" : {
         "type" : "string",
         "enum" : ["bar","pie","line","cashflow"]
       },
       "stats" : {
         "type" : "string"
       },
       "Invoiceid" : {
         "type" : "string"
       },
       "CustomerRef" : {
         "type" : "string"
       },
       "TxnDate" : {
         "type" : "string"
       },
       "minTxnDate" : {
         "type" : "string"
       },
       "maxTxnDate" : {
         "type" : "string"
       },
       "DueDate" : {
         "type" : "string"
       },
       "minDueDate" : {
         "type" : "string"
       },
       "maxDueDate" : {
         "type" : "string"
       },
       "TotalAmt" : {
         "type" : "string"
       },
       "minTotalAmt" : {
         "type" : "string"
       },
       "maxTotalAmt" : {
         "type" : "string"
       },
       "Balance" : {
         "type" : "string"
       },
       "minBalance" : {
         "type" : "string"
       },
       "maxBalance" : {
         "type" : "string"
       }
     },
    "required": [],
    "additionalProperties": true
   }
}
