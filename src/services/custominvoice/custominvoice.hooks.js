let _ = require('lodash');
let moment = require('moment');
let Ajv = require('ajv');
let feathersErrors = require('feathers-errors');
let errors = feathersErrors.errors;

let schema = {
	"properties": {
			"settingId": {
					"type": "string",
					"description": "settingId in String is requred",
			}
	},
	"required": ["settingId" ]
 
};

let contactResponse;
module.exports = {
	before: {
		all: [],
		find: [
			hook => beforeHook(hook)
		],
		get: [],
		create: [
			hook => beforeCreateInvoice(hook)
		],
		update: [],
		patch: [],
		remove: []
	},

	after: {
		all: [],
		find: [],
		get: [],
		create: [
			hook => afterCreateInvoice(hook)
		],
		update: [],
		patch: [],
		remove: []
	},

	error: {
		all: [],
		find: [],
		get: [],
		create: [],
		update: [],
		patch: [],
		remove: []
	}
};

async function beforeHook(hook){
	validateSchema(hook.params.query, schema)	
}

async function beforeCreateInvoice(hook){
	console.log("contact name",hook.data.Name);
	let queryBuild = {"settingId" : hook.data.settingId,"Name": hook.data.Name};
	await app.service("customcustomer").find({query:queryBuild})
		.then(async function(response) {
			console.log("/////////////////////customcustomer find response",response);
			if (response.total == 0 ) {
				let data = {
					'Name' : hook.data.Name,
					'EmailAddress' : hook.data.EmailAddress,
					'ContactStatus' : "ACTIVE",
					'settingId' : hook.data.settingId
				}
				await app.service("customcustomer").create(data).then(function(response){
					console.log("parsedBody contact post---------------->",response)
					contactResponse = response;
				}).catch(function(err){
					console.log(">>>>>>>>>>>>>>> err in post customcontact" , err)
					throw new errors.NotAcceptable(err)
				})
			}
			else {
				contactResponse = response.data[0]
			}
		})
		.catch(function(err) {
			throw new errors.NotAcceptable(err)
		})
	
	let invoiceCount =await hook.app.service("custominvoice").find({"settingId" : hook.data.settingId}).then(function(result){
		console.log("console.log(invoiceCount) ", result.total)
		return result.total
	})

	console.log("@@@@@@@@@@@@@@@@",hook.data.DueDate);
	let incr = invoiceCount+1
	
	if(hook.data.Products.length > 0){
		let maximum = _.map(hook.data.Products, function(o) { return o.qty * o.amount; });
		let Total = maximum.reduce(function(maximum, b) { return maximum + b; }, 0);
		hook.data.Date = new Date();
		hook.data.DueDate = new Date(hook.data.DueDate);
		hook.data.Total = parseFloat(Total.toFixed(2));
		hook.data.Paid = 0;
		hook.data.Due = parseFloat(Total.toFixed(2));
		hook.data.Status = 'AUTHORISED';
		hook.data.Invoice_No = "CINV-00"+incr
	}else{
		hook.data.Total = 0
		hook.data.Paid = 0;
		hook.data.Due = 0;
		hook.data.Status = 'AUTHORISED';
		hook.data.Invoice_No = "CINV-00"+incr
	}
}

async function afterCreateInvoice(hook) {
	console.log("aftercreate hook")
	if(hook.data.id){
		console.log(hook.result)
		await userTrackRecord(hook.result.settingId,contactResponse,hook.result);
	}
	
	// console.log("custominvoice create response",hook.result);
}

async function userTrackRecord(config,contactResponse,invoiceResponse) {
        console.log("configId",config);
        // console.log("contactResponse",contactResponse.data[0])
        // console.log("contactresponse name & email",contactResponse.data[0].Name,contactResponse.data[0].EmailAddress)
        // console.log("Invoice Id",invoiceResponse.InvoiceID);
        
        let invoiceId = invoiceResponse.Invoice_No;
        let customerName = contactResponse.Name
        let customerEmail = contactResponse.EmailAddress
        let queryBuild = { 'customerName' : customerName }
        // let queryBuild = { 'customerEmail' : customerEmail }
        console.log("================queryBuild",queryBuild);
        app.service('trackusersettings').find({query:queryBuild})
        .then(function(response) {
            console.log("-------------",response)
            if (response.total == 0) {
                let userObj = {
                    customerName : customerName,
                    customerEmail : customerEmail,
                    settingId : [],
                    invoiceId : []
                };
                userObj.settingId.push(config);
                userObj.invoiceId.push(invoiceId);
                app.service('trackusersettings').create(userObj)
                .then(function(resp) {
                    console.log("object create response",resp)
                })
                .catch(function(err) {

                })
            }
            else {
                let idArray = response.data[0].settingId;
                let flag = _.findIndex(idArray, function(o) { return o == config; });
                console.log("****************flag value",flag)
                if (flag >= 0) {

                    let invoiceIdArray = response.data[0].invoiceId
                    invoiceIdArray.push(invoiceId)
                    app.service('trackusersettings').patch(response.data[0].id ,{'invoiceId' : invoiceIdArray})
                    .then(function(result) {
                        console.log("++++++++++++++++++++++++settingId patch result inside if",result);
                    })
                    .catch(function(err) {
						throw new errors.NotFound(err)
                    })
                }
                else {
                    let settingIdArray = response.data[0].settingId
                    settingIdArray.push(config);
                    let invoiceIdArray = response.data[0].invoiceId
                    invoiceIdArray.push(invoiceId)
                    app.service('trackusersettings').patch(response.data[0].id ,{'settingId' : settingIdArray, 'invoiceId' : invoiceIdArray})
                    .then(function(result) {
                        console.log("++++++++++++++++++++++++settingId patch result inside else",result);
                    })
                    .catch(function(err) {
						throw new errors.NotFound(err)
                    })
                }
            }
        })
        .catch(function(err) {
			console.log("!!!!!!!!!!!!!!!!!!!!!",err)
			throw new errors.NotFound(err)
        })
    }

function validateSchema(data, schema) {
	let ajv = new Ajv(); 
	let validateSc = ajv.compile(schema);
	let valid = validateSc(data);
	console.log(valid)
	if (!valid) {
			throw new errors.NotAcceptable('user input not valid', validateSc.errors);
	}
}