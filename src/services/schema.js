module.exports = {
  find : {
    "properties" : {
      "domain" : {
        "type" : "string",
        "enum" : ["QB", "Xero"]
      }
    },
    "required": ["domain"],
     "additionalProperties": true
  }
}
