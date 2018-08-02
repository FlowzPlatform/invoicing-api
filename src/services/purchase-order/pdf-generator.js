var PdfPrinter  = require('pdfmake/src/printer')

var fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
};
var printer = new PdfPrinter(fonts);


let pdfBuffer=function(docContent)
{

    return new Promise(function(resolve,reject){

        if(!docContent)
            throw(new Error("Must require docContent"))

        var pdfDoc = printer.createPdfKitDocument(docContent);
        var chunks = [];

        pdfDoc.on('readable', function () {
            var chunk;
            while ((chunk = pdfDoc.read(9007199254740991)) !== null) {
                chunks.push(chunk);
            }
        });
        pdfDoc.on('end', function () {
           var result = Buffer.concat(chunks);
            resolve(result)
        })
        pdfDoc.end();

        
    })
  
}

module.exports=pdfBuffer