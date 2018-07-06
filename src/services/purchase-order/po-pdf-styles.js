
var poStyle=require('./po-pdf-style1')

let pdfContentStyle_1=function (poId,poDate,distributorInfo,supplierInfo,websiteName,products,productTypekey,total) {
	
	// console.log("postyle:--",distributorInfo.logo)
	let poLogo=poStyle.poLogo(distributorInfo.logo)//Distributor Logo
	let poContent=poStyle.poIDDetail(poId,poDate)//PO id and date
	let poDistributorAddress=poStyle.poDistributorAddress(distributorInfo.address,websiteName)//Distributor Address
	let poSupplierDetail=poStyle.poSupplierDetail(supplierInfo)//Supllier Info
	let poProductTable=poStyle.poProductTable(products,productTypekey,total)//Product Table
	let poStyles=poStyle.poPdfStyles()//Styles for PDF

	return {
		content: 
		[
			 {
				columns:
				[
					poLogo,
					{
						stack:poContent,						
						style: 'header'
					}
				]
			},
			{
				stack: poDistributorAddress
			},
			poSupplierDetail,
				{
				style: 'tableExample',
				table: poProductTable
			}
		],
		styles: poStyles
		
	}
}

module.exports.POStyle1=pdfContentStyle_1