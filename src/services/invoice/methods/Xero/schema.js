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
       "Name" : {
         "type" : "string"
       },
       "Date" : {
         "type" : "string"
       },
       "minDate" : {
         "type" : "string"
       },
       "maxDate" : {
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
       "InvoiceNumber" : {
         "type" : "string"
       },
       "Status" : {
         "type" : "string",
         "enum" : ["PAID" , "AUTHORISED" , "DRAFT"]
       },
       "SubTotal" : {
         "type" : "string"
       },
       "minSubTotal" : {
         "type" : "string"
       },
       "maxSubTotal" : {
         "type" : "string"
       },
       "TotalTax" : {
         "type" : "string"
       },
       "minTotalTax" : {
         "type" : "string"
       },
       "maxTotalTax" : {
         "type" : "string"
       },
       "Total" : {
         "type" : "string"
       },
       "minTotal" : {
         "type" : "string"
       },
       "maxTotal" : {
         "type" : "string"
       },
       "Invoiceid" : {
         "type" : "string"
       },
       "AmountDue" : {
         "type" : "string"
       },
       "minAmountDue" : {
         "type" : "string"
       },
       "maxAmountDue" : {
         "type" : "string"
       },
       "AmountPaid" : {
         "type" : "string"
       },
       "minAmountPaid" : {
         "type" : "string"
       },
       "maxAmountPaid" : {
         "type" : "string"
       }
     },
    "required": ["domain"],
    "additionalProperties": false
   }
}
