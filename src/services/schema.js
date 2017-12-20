module.exports = {
  find : {
    "properties" : {
      "domain" : {
        "type" : "string",
        "enum" : ["QB", "Xero"]
      },
      "chart" : {
        "type" : "string",
        "enum" : ["bar","pie","line","cashflow"]
      },
      "stats" : {
        "type" : "string",
        "enum" : [true, false]
      }
    },
    "required": ["domain"],
     "additionalProperties": false
  }
}
