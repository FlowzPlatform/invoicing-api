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
    //  if(!data.supplier_id) {
    //   throw new BadRequest('supplier_id text must exist');
    // }

     // Check if there is `supplier_id` property
     if(!data.owner_id) {
      throw new BadRequest('owner_id text must exist');
    }

  
    // Check if it is a string and not just whitespace
    if(typeof data.subscription_id !== 'string' || data.subscription_id.trim() === '') {
      throw new BadRequest('subscription_id text is invalid');
    }
    // if(typeof data.supplier_id !== 'string' || data.supplier_id.trim() === '') {
    //   throw new BadRequest('supplier_id text is invalid');
    // }
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
      owner_id: data.owner_id,
      special_information: data.special_information,
      user_info: data.user_info
    }
  
    context.data
        

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
        //    let supplierIndexOf =tempSupllierIds.indexOf(supplier_id);
           var posObj=poArray[supplier_id];
           if(posObj)
           {
                
                posObj.products.push(items)
           }else{
            var product= {
                created_at:date,
                subscription_id: data.subscription_id,
                website_id: data.website_id,
                websiteName: data.websiteName,
                order_id: data.order_id,
                setting_id: data.setting_id,
                quantity: data.quantity,
                total: data.total,
                owner_id: data.owner_id,
                products:[items],
                special_information: data.special_information,
                user_info: data.user_info
              }
              poArray[supplier_id]=product
           }
        }
    
      });
    
      console.log("PoArray::--",poArray)
      context.data=poArray;
      return context
  } 

var  checkPOSettingValidation = async function(context) {
    const { data } = context;
    console.log("data-->",data)
    let suppliersIds=Object.keys(data)
    var poArray=[]
    console.log("suppliersIds-->",suppliersIds)

    let date=new Date();
    return context.app.service('/po-settings').find(
        {query: 
            {
                supplier_id: 
                {
                    $in:suppliersIds
                }
            }
        }).then(result => {
        console.log("result-->",result)
    
        if(result && result.total==0)
            throw new BadRequest('CRM Purcahse order Setting not available');
      
        for (let index = 0; index < suppliersIds.length; index++) {
            const element = suppliersIds[index];
            var isAutoMode = _.result(_.find(result.data, function(obj) {
                return obj.supplier_id === element;
            }), 'isAuto');
            
            if(isAutoMode)
            {
                console.log('----------Po generate in auto mode--------------',element)

                    var poObj=data[element]
                    poObj.PO_generate_date= date
                    poObj.PO_generate_mode= "Auto"

                    poArray.push(poObj);
              
            }

        }

        if(poArray.length>0){
            context.data=poArray;
            return context
        }
        else
            throw new BadRequest('CRM Purcahse order generate in Manual Mode');
   
  })
}

  var poEmailSent=async function(context)
  {
    const { data } = context;

    console.log("Auto Email Config",data)
    if(data.id){
        let emailUrl=config.emailConfig.emailUrl;
        let body=  {"to":"igandhi@officebrain.com","from":"webmaster1@gmail.com","subject":"Invitation from Flowz","body":"dfdsfs"}
        return await axios.post(emailUrl, body)
            .then(function(response) {
                if (response.data.code == 200) {
                    
                    return context
                }
            })
            .catch(function(error) {
                console.log("Error Code:---",error.message)
                return context
            });

    }
    
  }
  
module.exports.validateObj = validate;
module.exports.checkPOSettingValidationObj = checkPOSettingValidation;
module.exports.poEmailSentObj = poEmailSent;
module.exports.poGenerateCalObj = poGenerateCal;