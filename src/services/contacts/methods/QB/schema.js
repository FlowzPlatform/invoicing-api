module.exports = {
    find : {
        "properties" : {
            "settingId" : {
                "description" : "Id of configuration"
            },
            "Name" : {
              "description" : "Name of contact"
            },
            "EmailAddress" : {
                "description" : "User Email"
            }
        },
        "required" : ["settingId"],
        "additionalProperties": true
    },

    create: {
        "properties" : {
            "settingId" : {
                "description" : "Id of configuration"
            },
            "Name" : {
                "description" : "Name of contact"
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
