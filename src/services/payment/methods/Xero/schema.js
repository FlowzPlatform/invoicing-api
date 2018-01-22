module.exports = {
    createPayment : {
     "properties" : {
        "settingId": {
          "type": "string"
        },
        "Name" : {
          "type" : "string"
        },
        "gateway" : {
          "type": "string"
        },
        "id" : {
            "type": "string"
        },
        "amount" : {
          "type": "number"
        },
        "type" : {
          "type": "string"
        },
        "cardNumber" : {
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
     "required": ["settingId","Name", "gateway","id", "amount", "cardNumber", "expMonth", "expYear", "cvc" ],
      "additionalProperties": true
    },

    find : {
      "properties" : {
        
      },
      "required": [],
      "additionalProperties": true
    },

    delete : {
       "properties": {
           
       },
       "required": [],
        "additionalProperties": false
    },

    update : {
       "properties":{
         
       },
       "required":[],
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
