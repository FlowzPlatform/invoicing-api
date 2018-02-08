module.exports = {
    find : {
      "properties" : {
          "settingId" : {
              "description" : "Id of configuration"
          },
          "InvoiceID" : {
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
   }
}
