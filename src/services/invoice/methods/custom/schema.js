module.exports = {
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
    }
}