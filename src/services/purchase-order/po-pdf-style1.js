
module.exports.poLogo=function(logo)
{
    return 	{
        image: logo,
        width: 200,
        height:100
    }
}

module.exports.poIDDetail=function(poId,poDate)
{
    return [
                'Purchase Order\n\n',
                {
                    text:[
                        {text: 'PO# : ', style: 'subheader'},
                        {text:poId, style: 'normaltext'},
                    ]
                },
                {
                    text: [
                        {text: 'Date : ', style: 'subheader'},
                        {text: poDate, style:'normaltext'}
                    ]
                 }
            ]
        
}

module.exports.poDistributorAddress=function(distributorAddress,websiteName)
{
   return  [
        {text :distributorAddress.name , fontSize: 18 , bold :true,margin:[0,5,0,0]},
        distributorAddress.AddressLine1,
        distributorAddress.AddressLine2,
        distributorAddress.city,
        distributorAddress.state,
        distributorAddress.country,
        distributorAddress.PostalCode,
        distributorAddress.mobile,
        {text : [{text: "Website Name : ",bold:true},websiteName] }
    ]
}

module.exports.poSupplierDetail=function(supplierInfo){
    return {
        text: [{text:'SUPPLIER : ',bold:true,fontSize:15},`${supplierInfo.supplier_name}  (${supplierInfo.email})`],
        margin: [0, 20],
    }
}

module.exports.poProductTable=function(products,productTypekey,total)
{

    let tableHeader=poProductTableHeader();
    let tableSubHeader=poProductTableSubHeader(productTypekey);
    let tableRows=productRows(products,productTypekey)

    let tableBody=[tableHeader,tableSubHeader]

    tableRows.forEach(row => {
        tableBody.push(row)
    });

    let netTotal=netAmount("$",total)
    tableBody.push(netTotal)

    return {   widths: [ "10%","32%","15%","15%","15%","13%"],
                body: tableBody
            }
}

function poProductTableHeader()
{
    return [{ text: 'SKU#', rowSpan: 2, bold: true, alignment: 'center' },
    { text: 'Product Name', rowSpan: 2, bold: true },
    { text: 'Product Order', colSpan: 2, bold: true, alignment: 'center' },
    {},
    { text: 'Total Quntity * Unit Price in $', rowSpan: 2, bold: true, alignment: 'center' },
    { text: 'Total (in $)', rowSpan: 2, bold: true, alignment: 'right' }]
}
function poProductTableSubHeader(productTypekey)
{
    return [{}, {}, { text: productTypekey ,bold: true}, { text: 'Quntity',bold: true }, {},{}]
}

function productRows(products,productTypekey){

    let productsTableRows=[]
    for (let index = 0; index < products.length; index++) {
        let productR=productRow(products[index],productTypekey)
        productsTableRows.push(productR)
    }
    return productsTableRows
}

function productRow(product,productTypekey){
    let productJson = []

    let productSKU = { text: product.product_description.sku, rowSpan: 1 , alignment: 'center'}
    let productName = { text: product.product_description.product_name, rowSpan: 1 }
    let productTypes = productTypeList(product[productTypekey])

    let typesQuntityMulti = { text: `${product.unit_price} * ${product.total_qty}`, rowSpan: 1, alignment: 'center' }
    let totalPrice = { text: `${product.unit_price * product.total_qty}`, rowSpan: 1 ,alignment: 'right' }

    productJson.push(productSKU)
    productJson.push(productName)
    productJson.push(productTypes)
    productJson.push({})
    productJson.push(typesQuntityMulti)
    productJson.push(totalPrice)

  return productJson;
}

function productTypeList(productsTypes){

    let typeQuntityBody = []
    for (const key in productsTypes) {
        if (productsTypes.hasOwnProperty(key)) {
            typeQuntityBody.push([key, productsTypes[key]])
        }
    }

    return {
        table: {
            widths: ['*', '*'],
            body: typeQuntityBody
        },
        layout: {
            hLineWidth: function (i, node) {
                if(node.table.body)
                    return (i === 0 || i === node.table.body.length) ? 0 : 1;
                else
                    return 1
            },
            vLineWidth: function (i, node) {
                if(node.table.body)
                    return (i === 0 || i === node.table.widths.length) ? 0 : 1;
                        else
                    return 1
            }
        }, margin: [-3, -3, -3, -3], colSpan: 2
    }
}

function netAmount(currency,total){
    return [
        
        {
         text:'',
         border: [false, false, false, false],
         colSpan:4
         
        },
        {
            
        },{},{},{   	border: [false, false, false, true],
          "text": "Net Amount",
          bold:true,
          colSpan:1,
          alignment:'right',
            margin:[0,5,0,5]
        },
        {
            border: [false, false, false, true],
          "text": currency+total,
          alignment:'right',
          margin:[0,5,0,5]
        }
      ]
}


module.exports.poPdfStyles=function(){
    return {
	    normaltext:{
	        fontSize: 12,
	        bold: false,
			margin: [0, 50, 0, 0]
	    },
		header: {
			fontSize: 25,
			bold: true,
			alignment: 'right',

			margin: [0, 0, 0,5]
		},
		subheader: {
			fontSize: 14,
			margin: [0, 50, 0, 0]
			
		},
		superMargin: {
			margin: [20, 0, 40, 0],
			fontSize: 15
		}
	}
}


