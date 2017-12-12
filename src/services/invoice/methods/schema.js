module.exports = {
    create : {
       "properties": {
           "gateway": {
               "type": "string",
               "enum": ["stripe", "authdotnet"]
           },
           "cardNumber": {
               "description": "card Nunber"
           },
           "expMonth": {
               "description": "card expiry month"
           },
           "expYear": {
               "description": "card expiry year"
           },
           "cvc": {
               "description": "CVC in Number",
               "type": "number"
           },
           "description": {
               "description": "Customer description in String",
               "type": "string"
           },
           "email": {
               "description": "email  in String",
               "type": "string"
           }
       },
       "required": ["cardNumber", "gateway", "expMonth", "expYear", "cvc"],
        "additionalProperties": false
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
       "Type" : {
         "type" : "string"
       },
       "Date" : {
         "type" : "string"
       },
       "DueDate" : {
         "type" : "string"
       },
       "InvoiceNumber" : {
         "type" : "string"
       },
       "CurrencyCode" : {
         "type" : "string"
       },
       "CurrencyRate" : {
         "type" : "string"
       },
       "Status" : {
         "type" : "string",
         "enum" : ["PAID" , "AUTHORISED" , "DRAFT"]
       },
       "SubTotal" : {
         "type" : "string"
       },
       "TotalTax" : {
         "type" : "string"
       },
       "Total" : {
         "type" : "string"
       },
       "InvoiceID" : {
         "type" : "string"
       },
       "AmountDue" : {
         "type" : "string"
       },
       "AmountPaid" : {
         "type" : "string"
       }
     },
    "required": [],
    "additionalProperties": true
   }
}
