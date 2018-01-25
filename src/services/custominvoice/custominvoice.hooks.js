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
		create: [],
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
	
	let invoiceCount =await hook.app.service("custominvoice").find({"settingId" : hook.data.settingId}).then(function(result){
		console.log("console.log(invoiceCount) ", result.total)
		return result.total
	})

	console.log("#DueDate " ,  moment(hook.data.DueDate).format('DD/MM/YYYY'))
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

function validateSchema(data, schema) {
	let ajv = new Ajv(); 
	let validateSc = ajv.compile(schema);
	let valid = validateSc(data);
	console.log(valid)
	if (!valid) {
			throw new errors.NotAcceptable('user input not valid', validateSc.errors);
	}
}