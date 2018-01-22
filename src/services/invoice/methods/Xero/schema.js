module.exports = {
    find : {
        "properties" : {
            "settingId" : {
                "description" : "Id of configuration"
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
            "InvoiceID" : {
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
        "required" : ["settingId"],
        "additionalProperties": true
    },

    findChart : {
        "properties": {
            "settingId" : {
                "description" : "Id of configuration"
            },
            "chart" : {
                "type" : "string",
                "enum" : ["bar","pie","line","cashflow"]
            },
            "stats" : {
                "type" : "string"
            },
            "date1" : {
                "description" : "min date for chart",
                "type" : "string"
            },
            "date2" : {
                "description" : "max date for chart",
                "type" : "string"
            }
        },
        "required": ["settingId","date1","date2"],
        "additionalProperties": true
    },

    create: {
        "properties" : {
            "settingId" : {
                "description" : "Id of configuration"
            },
            "Name" : {
                "description" : "Name of contact"
            },
            "DueDate" : {
                "type" : "string"
            },
            "products" : {
                "type" : "array"
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
        "required" : ["settingId","Name"],
        "additionalProperties": true
    },

    get : {
        "properties": {
                "settingId" : {
                    "description" : "Id of configuration"
                }
        },
        "required": ["settingId"],
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
        "additionalProperties": true
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
        "additionalProperties": true
    }
}
