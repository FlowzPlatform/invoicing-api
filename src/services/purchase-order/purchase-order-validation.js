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
      subscription_id: data.subscription_id,
      website_id: data.website_id,
      websiteName: data.websiteName,
      order_id: data.id,
      setting_id: data.setting_id,
      quantity: data.quantity,
      total: data.total,
      products: data.products,
      distributor_id : data.owner_id,
      special_information: data.special_information,
      user_info: data.user_info    ,
      user_billing_info:data.user_billing_info,
      ismanual:data.ismanual
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
        
        if(supplier_id)
        {
            var poNewId=generateCustomId("PO",[data.subscription_id,supplier_id,data.order_id])
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
                subscription_id: data.subscription_id,
                website_id: data.website_id,
                websiteName: data.websiteName,
                order_id: data.order_id,
                setting_id: data.setting_id,
                quantity: data.quantity,
                total: data.total,
                distributor_id : data.distributor_id,
                products:[items],
                special_information: data.special_information,
                user_info: data.user_info,
                EmailStatus:"Initiated",
                user_billing_info:data.user_billing_info,
                ismanual:data.ismanual
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

    idsArray.forEach(element => {
        
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
    // let ismanual=data[suppliersIds[0]].ismanual
   
    let {subscription_id:subscriptionId,distributor_id:distId,website_id:websiteId,ismanual:ismanual=false}=data[suppliersIds[0]];
    var poArray=[]
   

    let date=new Date();

    if (ismanual) {
        for (let index = 0; index < suppliersIds.length; index++) {
            const element = suppliersIds[index];
            console.log('----------Po generate in manual  mode--------------', element)
            var poObj = data[element]
            delete poObj.ismanual
            poObj.PO_generate_date = date
            poObj.PO_generate_mode = "Manual"
            poArray.push(poObj);
        }
        if (poArray.length > 0) {
            context.data = poArray;
            return context
        }
    } else {
        return context.app.service('/po-settings').find(
            {
                query:
                    {
                        subscription_id: subscriptionId,
                        distributor_id: distId,
                        // website_id:websiteId,
                        supplier_id:
                            {
                                $in: suppliersIds
                            }
                    }
            }).then(result => {
                console.log("result-->", result)

                if (result && result.total == 0)
                    throw new BadRequest('CRM Purcahse order Setting not available');

                for (let index = 0; index < suppliersIds.length; index++) {
                    const element = suppliersIds[index];
                    var isAutoMode = _.result(_.find(result.data, function (obj) {
                        return obj.supplier_id === element;
                    }), 'po_generate_mode');

                    if (isAutoMode == 'auto') {
                        console.log('----------Po generate in auto mode--------------', element)
                        var poObj = data[element]
                        poObj.PO_generate_date = date
                        poObj.PO_generate_mode = "Auto"
                        poArray.push(poObj);
                    }

                }

                if (poArray.length > 0) {
                    context.data = poArray;
                    return context
                }
                else
                    throw new BadRequest('CRM Purcahse order generate in Manual Mode');

            })
    }
}

  var poEmailSent=async function(context)
  {
    const { data } = context;
    // console.log("Auto Email Config",data)
    let emailUrl=config.emailConfig.emailUrl;
                
    let body=  {"to":"","from":"webmaster1@gmail.com","subject":"Invitation from Flowz","body":"dfdsfs"}

    // if (data.constructor === arrayConstructor){
        console.log("<----Array--------->");
        let axiosArray=[]
        data.forEach(el => {
            // if(el.id)
            // {
                // console.log("Auto el.id",el.id)
            body.to=el.user_info.email
            axiosArray.push(axios.post(emailUrl, body))
            // }
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
                console.log("resultArray error--------->",error.message);
            
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