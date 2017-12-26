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
       "required": ["domain", "amount"],
        "additionalProperties": false
   },

   createPayment : {
     "properties" : {
       "gateway" : {
         "type": "string"
       },
       "id" : {
          "type": "string"
       },
       "amount" : {
         "type": "number"
       },
       "cname" : {
         "type": "string"
       },
       "value" : {
         "type": "string"
       },
      "type" : {
        "type": "string"
      },
      "cardNum" : {
        "type": "string"
      },
      "expMonth" : {
        "type": "string"
      },
      "expYear" : {
        "type": "string"
      },
      "cvc" : {
        "type": "string"
      },
     },
     "required": ["gateway","id", "amount", "cname", "value"],
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
