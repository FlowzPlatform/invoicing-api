const config = require('../config.js');
const axios = require('axios');
// const poPdf = require('./po-pdf'); 
// const rp = require('request-promise');
// let domainKey = process.env.domainKey;
// let baseUrl = 'http://api.' + domainKey;

module.exports = {
  before: {
    all: [],
    find: [
      hook => beforeFind(hook)
    ],
    get: [],
    create: [
      hook => beforeCreate(hook)
    ],
    update: [],
    patch: [
    ],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => afterCreate(hook)
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

function beforeFind(hook) {
  if(hook.params.query.websiteId == undefined) {
    hook.result = {status:400, message: "Please pass websiteId"}
  }
}

function beforeCreate(hook) {
  // console.log('hook------------->',hook.data);
  hook.data.createdAt = new Date();
  var array = hook.data.PO_id.split('_');
  // console.log('array------------------->',array);
  hook.data.invoiceId = 'INV_' + array[0] + '_' + array[1] + '_' + hook.data.orderId.substr(-5);
  hook.data.status = 'pending';
}

function afterCreate(hook) {
  console.log('hook.data.id in after create',hook.data.id);
  if (hook.data.id != undefined) {
    let emailbody;
    hook.data.invoiceId = hook.data.invoiceId + '_' + hook.data.id.substr(-5);
    // console.log('hook.data.invoiceId', hook.data.invoiceId);
    // await axios({
    //   method: 'PATCH',
    //   url: baseUrl + '/po-invoice/' + hook.data.id,
    //   data: { 'invoiceId': hook.data.invoiceId }
    // }).then(function (response) {
    //   console.log('patch response', response);
    //   if(Object.keys(hook.data.paymentInfo).length === 0){
    //     emailbody = `<div ref='email'>
    //     <h2>Purchase Order</h2>
    //     <p style='font-size:16px'>Your Invoice ${hook.data.invoiceId} amounting to ${hook.data.total_amount} is generated regarding to PO ${hook.data.PO_id} from ${hook.data.supplier_email}</p>
    //     <p style='font-size:16px'>For more Information <a href='https://crm.${process.env.domainKey}/#/po_invoice' style='font-size:16px'>click here</a></p>  
    //     </div>`;
    //   }else{
    //     emailbody = `<div ref='email'>
    //     <h2>Purchase Order</h2>
    //     <p style='font-size:16px'>Your Invoice ${hook.data.invoiceId} amounting to ${hook.data.total_amount} is generated regarding to PO ${hook.data.PO_id} from ${hook.data.supplier_email}</p>
    //     <p style='font-size:16px'>To Pay the Invoice of Purchase order please click below Button.</p>
    //     <a href='https://crm.${process.env.domainKey}/#/purchase-order-received' style='background-color:#EB7035;border:1px solid #EB7035;border-radius:3px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:16px;line-height:44px;text-align:center;text-decoration:none;width:150px;-webkit-text-size-adjust:none;mso-hide:all;'>Pay Now</a>  
    //     </div>`; 
    //   }
    //   let body = {'to':hook.data.distributor_email,'from':hook.data.supplier_email,'subject':`Invoice Generated for PO Id :- ${hook.data.PO_id}` ,'body':emailbody}
    //   // console.log('config.emailConfig.emailUrl',config.emailConfig.emailUrl);
    //   axios({
    //     method: 'POST',
    //     url: config.emailConfig.emailUrl,
    //     data: body
    //   }).then(function (response) {
    //     // console.log(response);
    //   }).catch(function (error) {
    //     // console.log(error);
    //   });
    // }).catch(function (error) {
    //   console.log("error")
    // });
    // 
    console.log('hook.data.id invoiceId', hook.data.invoiceId);
    hook.app.service('po-invoice').patch(hook.data.id, { 'invoiceId': hook.data.invoiceId })
      .then(function (res) {
        console.log("in then", res)
        if (Object.keys(hook.data.paymentInfo).length === 0) {
          emailbody = `<div ref='email'>
                      <h3>Dear </h3>
                      <p style='font-size:16px'>Your have received invoice for purchase order ${hook.data.PO_id} from supplier ${hook.data.supplier_email}</p>
                      <p style='font-size:16px'>Please contact supplier for further detail</p>  
                      <p style='font-size:16px'>Regards</p>
                      </div>`;
        } else {
          emailbody = `<div ref='email'>
                      <h3>Dear </h3>
                      <p style='font-size:16px'>Your have received invoice for purchase order ${hook.data.PO_id} from supplier ${hook.data.supplier_email}</p>
                      <p style='font-size:16px'>You can review & pay invoice from your CRM  account </p>  
                      <p style='font-size:16px'>Regards</p>
                      </div>`;
        }

        let body = { 'to': hook.data.distributor_email, 'from': hook.data.supplier_email, 'subject': `Invoice for  PO Id :- ${hook.data.PO_id}`, 'body': emailbody };
        // console.log('config.emailConfig.emailUrl',config.emailConfig.emailUrl);

              axios({
                method: 'POST',
                url: config.emailConfig.emailUrl,
                data: body
              }).then(function (response) {
                console.log("Email respnse:--",response);
              })
        
        
        // let POPDF=poPdf(res)
        // console.log("POPDF-->",POPDF)
        // hook.app.service('/exporttopdf').create({"html":POPDF})
        //   .then(function(pdfData){
        //       console.log("Pdf data:-->",pdfData);
        //       return pdfData;
        //   }).then(function(data){
        //   let body = { 
        //     'to': "igandhi@officebrain.com",
        //     'from': hook.data.supplier_email, 
        //     'subject': `Invoice for  PO Id :- ${hook.data.PO_id}`, 
        //     'body': emailbody,
        //     'attachments': [
        //       {
        //           'filename': 'test.pdf',
        //           'content': data.toString('base64'),
        //           'cid': 'test.pdf',
        //           'encoding': 'base64'
        //       }
        //       ]
        
        //   }

        //     axios({
        //       method: 'POST',
        //       url: config.emailConfig.emailUrl,
        //       data: body
        //     }).then(function (response) {
        //       console.log("Email respnse:--",response);
        //     })
        //   })
        
        
        // axios({
        //   method: 'POST',
        //   url: config.emailConfig.emailUrl,
        //   data: body
        // }).then(function (response) {
        //   // console.log(response);
        // }).then(function (response){

        // }).catch(function (error) {
        //   // console.log(error);
        // });
      })
      .catch(function (err) {
        // console.log("err", err)
      });
  }
}

// function beforePatch (hook) {
//   console.log('inside before patch',hook.data)
// }
