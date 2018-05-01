const { BadRequest,NotFound } = require('@feathersjs/errors');
const config=require("../config.js")
const axios=require("axios")
var _ = require('lodash')
var validate= async function(context) {
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
      settingId: data.setting_id,
      quantity: data.quantity,
      total: data.total,
      products: data.products,
      distributorId : data.owner_id,
      special_information: data.special_information,
      user_info: data.user_info    ,
      user_billing_info:data.user_billing_info,
       distributor_email : data.distributor_email,
      isManual:data.isManual
    }  
    return context;
  }; 

  var poGenerateCal=function(context)
  { 
    const { data } = context;
      var poArray={};
        var date=new Date();
      var orderProductLIst=data.products;

      orderProductLIst.forEach(items => {
        
        var supplier_id=items.product_description.supplier_id
        
        console.log("data.subscription_id",data.subscriptionId)
        console.log("supplier_id",supplier_id)
        console.log("data.order_id",data.orderId)
        if(supplier_id)
        {   
            var poNewId=generateCustomId("PO",[data.subscriptionId,supplier_id,data.orderId])
            console.log("PO Ids:--",poNewId)
            //    let supplierIndexOf =tempSupllierIds.indexOf(supplier_id);
           var posObj=poArray[supplier_id];
           if(posObj)
           {    
                posObj.PO_id=poNewId
                posObj.EmailStatus="Initiated"
                posObj.products.push(items)
           }else{
            var product= {
                PO_id:poNewId,
                created_at:date,
                subscriptionId: data.subscriptionId,
                websiteId: data.websiteId,
                websiteName: data.websiteName,
                orderId: data.orderId,
                settingId: data.settingId,
                quantity: data.quantity,
                total: data.total,
                distributorId : data.distributorId,
                products:[items],
                special_information: data.special_information,
                user_info: data.user_info,
                EmailStatus:"Initiated",
                user_billing_info:data.user_billing_info,
                isManual:data.isManual,
                 distributor_email : data.distributor_email

              }
              poArray[supplier_id]=product
           }
        }
    
      });
      
      context.data=poArray;
      return context
  } 

var generateCustomId=function(prefix,idsArray)
{
    let id=prefix;
    console.log("idsArray",idsArray)
    idsArray.forEach(element => {
        console.log("element",element);
        id=id.concat("_"+element.substr(element.length-5));
    });
    return id;
}


var checkPOSettingValidation = async function(context) {
    const { data } = context;
    // console.log("data-->",data)
    let suppliersIds=Object.keys(data)
    // console.log("subscription_id-->",data[suppliersIds[0]].subscription_id)
    // console.log("distributor_id -->",data[suppliersIds[0]].distributor_id )
    // console.log("website_id-->",data[suppliersIds[0]].website_id)
   
    // let subscriptionId=data[suppliersIds[0]].subscription_id
    // let distId=data[suppliersIds[0]].distributor_id
    // let websiteId=data[suppliersIds[0]].website_id
    // let isManual=data[suppliersIds[0]].isManual
   
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
            return context
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

                    let con= poEmailSent(context)
                    return con
                }
                else
                context.result={"status":404,"message":"PO setting not found"}  

            })
    }
}

  var poEmailSent=async function(context)
  {
    const { data } = context;
    // console.log("Auto Email Config",data)
    let emailUrl=config.emailConfig.emailUrl;
                
  

    // if (data.constructor === arrayConstructor){
        console.log("<----Array--------->");
        let axiosArray=[]
        data.forEach(el => {
            let {product_description:{supplier_info:{email :toMail } }}=el.products[0]
            let body=  {"to":toMail,"from":el.distributor_email,"subject":`Purchase Order Generated for Order Id :- ${data.order_id}` ,"body":`PO order generated succesfully, View more.. Click on link https://crm.${process.env.domainKey}/purchase-order?PO_id=${el.PO_id}`}
            axiosArray.push(axios.post(emailUrl, body))
        });
        if(axiosArray.length>0){
            return await axios.all(axiosArray).then(values=>{
                console.log("<----Email Successfully--------->");
                // console.log("Values:---",values)
                let counter=0;
                values.forEach(value => {
                    context.data[counter].EmailStatus="Sent"
                    counter++;                
                });
                    // console.log("context.data--------->",context.data);
                    return context;    
            }).catch(error=>{
                console.log("Email error--------->",error.message);
            
                return context;
            })
        }    
  }
  var POUpdateInMyOrder=async function(context)
  {
    var { data } = context
    if(data.id){
            axios({
                method: 'PATCH',
                // url: " http://172.16.160.229:3032/myOrders/d578a83e-7f5f-47ae-b64f-e4bdc019826b",//+data.order_id
                url:    "http://"+process.env.domainKey+"/myOrders/"+data.order_id,
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