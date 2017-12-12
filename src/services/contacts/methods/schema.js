module.exports = {
    create: {
        "properties": {
            "gateway": {
                "type": "string",
                "enum": ["stripe", "authdotnet"]
            },
            "Name": {
                "description": "name"
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
        "required": ["Name"],
        "additionalProperties": false
    },


    delete: {
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



    update: {
        "properties": {
            "gateway": {
                "type": "string",
                "enum": ["stripe", "authdotnet"]
            },
            "customer": {
                "description": "customerid in String",
                "type": "string"
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
        "required": ["customer", "gateway"],
        "additionalProperties": false
    },


    get: {
        "properties": {

            "Name": {
                "type": "string",
                "description": "user name",
            },
            "EmailAddress": {
                "type": "string",
                "description": "user email"
            },
            "ContactStatus": {
                "type": "string",
                "description": "contact status",
            },
            "IsSupplier": {
                "type": "boolean",
                "description": "is supplier",
            },
            "IsCustomer": {
                "type": "boolean",
                "description": "is customer",
            }
        },
        //"required": [],
        "additionalProperties": false
    },
}