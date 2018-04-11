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
    }
}