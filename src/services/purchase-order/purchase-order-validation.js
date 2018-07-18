const { BadRequest,NotFound } = require('@feathersjs/errors');
const config=require("../config.js")
const axios=require("axios")
var _ = require('lodash')
var pdfGen=require('./pdf-generator')
var pdfStyle=require('./po-pdf-styles')
var moment=require('moment')
var fs = require('fs');
var validate= async function(context){
    const { data } = context;
  
    // Check if there is `subscription_id` property
    if(!data.subscription_id) {
      throw new BadRequest('subscription_id text must exist');
    }
  
    //  // Check if there is `supplier_id` property
     if(!data.products) {
      throw new BadRequest('No product found');
    }

     // Check if there is `supplier_id` property
     if(!data.owner_id) {
      throw new BadRequest('owner_id text must exist');
    }

    // Check if it is a string and not just whitespace
    if(typeof data.subscription_id !== 'string' || data.subscription_id.trim() === '') {
      throw new BadRequest('subscription_id text is invalid');
    }
    if(data.products.length ==0) {
      throw new BadRequest('No product found');
    }

    if(typeof data.owner_id !== 'string' || data.owner_id.trim() === '') {
      throw new BadRequest('owner_id text is invalid');
    }
  
    // Change the data to be only the text
    // This prevents people from adding other properties to our database
    context.data = {
        created_at:new Date(),
        subscriptionId: data.subscription_id,
        websiteId: data.website_id,
        websiteName: data.websiteName,
        orderId: data.order_id,
        order_unique_id: data.id,
        settingId: data.setting_id,
        quantity: data.quantity,
        total: data.total,
        products: data.products,
        distributorId : data.owner_id,
        special_information: data.special_information,
        user_info: data.user_info    ,
        user_billing_info:data.user_billing_info,
        distributor_email : data.distributor_email,
        distributor_info : data.distributor_info,
        isManual:data.isManual
    };
    return context;
}; 

var poGenerateCal=function(context)
{ 
    const { data } = context;
    // console.log("data--------------",data);
    var poArray={};
    var date=new Date();
    var orderProductLIst=data.products;
    let qty = 0;
    let total = 0;
    orderProductLIst.forEach(items => {
            
        var supplier_id=items.product_description.supplier_id
        
        // console.log("data.subscription_id",data.subscriptionId)
        // console.log("supplier_id",supplier_id)
        // console.log("data.order_id",data.orderId)

        // console.log('product qty', items.total_qty)
        // console.log('product unit_price', items.unit_price)
        if(supplier_id)
        {   
            var poNewId=generateCustomId("PO",[data.subscriptionId,supplier_id,data.orderId])
            console.log("PO Ids:--",poNewId)
            //    let supplierIndexOf =tempSupllierIds.indexOf(supplier_id);
            var posObj=poArray[supplier_id];

            if(posObj)
            {    
                qty += parseFloat(items.total_qty);
                total += parseFloat(items.total_qty) * parseFloat(items.unit_price)
                //  posObj.PO_id=poNewId
                //posObj.EmailStatus="Initiated"
                posObj.quantity = qty;
                posObj.total = total;
                posObj.products.push(items)
            }else{
                qty = parseFloat(items.total_qty);
                total = qty * parseFloat(items.unit_price);
                let supplier_info = items.product_description.supplier_info;
                // console.log("distributor_info", data.distributor_info)
                supplier_info.supplier_id = items.product_description.supplier_id;
                // supplier_info['supplier_id'] = items.supplier_id;

                var product = {
                    PO_id:poNewId,
                    created_at:date,
                    subscriptionId: data.subscriptionId,
                    websiteId: data.websiteId,
                    websiteName: data.websiteName,
                    orderId: data.orderId,
                    order_unique_id: data.order_unique_id,
                    settingId: data.settingId,
                    quantity: qty,
                    total: total,
                    distributorId : data.distributorId,
                    products:[items],
                    special_information: data.special_information,
                    user_info: data.user_info,
                    EmailStatus:"Initiated",
                    user_billing_info:data.user_billing_info,
                    isManual:data.isManual,
                    distributor_email : data.distributor_email,
                    distributor_info: data.distributor_info,
                    supplier_info: supplier_info
                }
                poArray[supplier_id]=product
            }
        }
        
    });
    // console.log("poArray", poArray)
    context.data=poArray;
    return context
}

//   var countOrderId=function(context,orderID)
//   {
//       return  new Promise(function(resolve, reject){
//         context.app.service('/purchase-order').find({
//             query:
//                 {
//                     $limit: 0,
//                     order_unique_id: orderID               
//                 },
               
//         }).then(result=>{
//             console.log("Count Result:--",result)
//             resolve(result.total)
//         })
//       })
      
//   }

var generateCustomId=function(prefix,idsArray)
{
    let id=prefix;
    console.log("idsArray",idsArray)
    idsArray.forEach(element => {
        console.log("element",element);
        id=id.concat("_"+(element.length<=5 ? element : element.substr(element.length-5)));
    });
    return id;
}


var checkPOSettingValidation = async function(context) {
    const { data } = context;
    // console.log("data-->",data)
    let suppliersIds=Object.keys(data)
  
    let {subscriptionId:subscriptionId,distributorId:distId,websiteId:websiteId,isManual:isManual=false}=data[suppliersIds[0]];
    var poArray=[]

    let date=new Date();

    if (isManual) {
        for (let index = 0; index < suppliersIds.length; index++) {
            const element = suppliersIds[index];
            console.log('------------Po generate in manual  mode--------------', element)
            var poObj = data[element]
            delete poObj.isManual
            poObj.PO_generate_date = date
            poObj.PO_generate_mode = "Manual"
            poArray.push(poObj);
        }
        if (poArray.length > 0) {
            context.data = poArray;
        }
    } else {
        console.log("subscription_id",subscriptionId,distId , websiteId)
        return context.app.service('/po-settings').find(
            {
                query:
                    {
                        subscriptionId: subscriptionId,
                        distributorId: distId,
                        websiteId:websiteId,
                        supplierId:
                            {
                                $in: suppliersIds
                            }
                    }
            }).then(result => {
                console.log("result-->", result)

                if (result && result.total == 0)
                context.result={"status":404,"message":"PO setting not found"}  

                // let isAuto = (auto) => {
                //     auto
                // }

                for (let index = 0; index < suppliersIds.length; index++) {
                    const element = suppliersIds[index];
                    var isAutoMode = _.result(_.find(result.data, function (obj) {
                        return obj.supplierId === element;
                    }), 'po_generate_mode');
                    if (isAutoMode == 'Auto') {
                        var poObj = data[element]
                        poObj.PO_generate_date = date
                        poObj.PO_generate_mode = "Auto"
                        poArray.push(poObj);
                    }

                }

                if (poArray.length > 0) {
                    context.data = poArray;
                }
                else
                context.result={"status":404,"message":"PO setting not found"}  

            })
    }
}

var poEmailSent = async function(context)
{
    console.log('-------------context',context.EmailStatus, context.PO_id);
    let date=moment().format('DD-MMM-YYYY') 
    let pdfContent=pdfStyle.POStyle1(context.PO_id,date,context.distributor_info,context.supplier_info,context.websiteName,context.products,'color',context.total)
    console.log("PDF Make:--",JSON.stringify(pdfContent))
    return pdfGeneratePromise(context,pdfContent);

}

var pdfGeneratePromise=function(context,pdfContent){

    let { product_description: { supplier_info: { email: toMail, supplier_name: supplierName } } } = context.products[0];
    let { websiteName: websiteName, website_id: websiteId, distributor_email: distributorEmail = '' } = context;

    let emailBody = `<div ref="email">
            <h3>Dear ${(supplierName && supplierName.length > 0) ? supplierName : toMail}</h3>
            <p style="font-size:16px">You have received purchase order for website <b>${(websiteName && websiteName.length > 0) ? websiteName : websiteId}</b> for distributor <b>${distributorEmail}</b></p>
            <p style="font-size:16px">To view the Purchase order detail:</p>
            <a href=" https://crm.${process.env.domainKey}/#/purchase-order-received?PO_id=${context.PO_id}" style="background-color:#EB7035;border:1px solid #EB7035;border-radius:3px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:14px;line-height:30px;text-align:center;text-decoration:none;width:90px;-webkit-text-size-adjust:none;mso-hide:all;">View Order</a>    
            <p style="font-size:16px">Regards</p>
            </div>`;

  return pdfGen(pdfContent).then(function(fileData){
    console.log("---PDF Generate Successfully-----") 
         return fileData
  
    }).then(function(data){
        console.log("---Email sending-----") 
        return emailSentAxios(toMail,context.distributor_email, "obsoftcare@gmail.com","Purchase order for website",emailBody,context.PO_id,data)
    }).then(response=>{
        console.log("---Email sent successfully-----") 
        context.EmailStatus = "Sent";
        console.log("inside then context",context.EmailStatus);
        return context
    }).catch(function(error){
        console.log("Gen error:--",error)
        return context
    }) 
}

var emailSentAxios=function(to,cc,from,subject,emailBody,fileName,fileContent) {
    let emailUrl=config.emailConfig.emailUrl;
    let body = { 
        "to": to, 
        "cc":cc,
        "from": from, 
        "subject": subject, 
        "body": emailBody
     }

    if (fileName && fileContent) {
        body.attachments = [
            {
                'filename': fileName + '.pdf',
                'content': fileContent.toString('base64'),
                'cid': fileName + '.pdf',
                'encoding': 'base64'
            }
        ]
    }

    return axios.post(emailUrl, body)
        .then(function(response) {
            console.log("inside then context",response.data);
            // console.log()
            // return context;`
            return response
        })
        .catch(function(error) {
            console.log("inside catch context", error);
            // return context;
            throw(error)
        })
}
var POUpdateInMyOrder=async function(context)
{
    let { data } = context
    if(data.id){
        data.PO_id = data.PO_id + '_' + data.id.substr(-5);
        console.log("--------data.id",data.id);
        let mail = await poEmailSent(data);
        console.log('email status',data.EmailStatus);
        await app.service('purchase-order').patch(data.id, { 'PO_id': data.PO_id, 'EmailStatus': data.EmailStatus || false });
        axios({
            method: 'PATCH',
            // url: " http://172.16.160.229:3032/myOrders/d578a83e-7f5f-47ae-b64f-e4bdc019826b",//+data.order_id
            url:    "https://api."+process.env.domainKey+"/serverapi/myOrders/"+data.order_unique_id,
            data: { "po_detail":{ [data.products[0].product_description.supplier_id] : {PO_id:data.PO_id}}}
        })  
        .then(function (response) {
            // console.log('response------------------------>',response)
        
        })
        .catch(function (error) {
            console.log('error',error.message)
        })
    }
}
module.exports.validateObj = validate;
module.exports.checkPOSettingValidationObj = checkPOSettingValidation;
module.exports.poEmailSentObj = poEmailSent;
module.exports.poGenerateCalObj = poGenerateCal;
module.exports.POUpdateInMyOrderObj =POUpdateInMyOrder