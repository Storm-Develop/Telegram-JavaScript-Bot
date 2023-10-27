const fs = require('fs');
const {InputFile } = require('grammy');
const pdfMake = require('pdfmake/build/pdfmake')
const pdfFonts = require('pdfmake/build/vfs_fonts');

module.exports = {
  name: "create_pdf",
  description: "Create a PDF document using the provided text.",
  usage: "/create_pdf",
  example: "/create_pdf",
  category: "Create PDF",
  handler: async (conversation,ctx) => {    
    try {
            
      await ctx.reply('Welcome! Please enter the text you want to create PDF for.');

      const pdfTextDescriptions = [];

      while (true) {
        const pdfDescriptionResponse = await conversation.wait();
      
        if (!pdfDescriptionResponse || !pdfDescriptionResponse.message || !pdfDescriptionResponse.message.text) {
          await ctx.reply('Invalid text description. Please try again.');
        } else {
          const text = pdfDescriptionResponse.message.text;
          if (text.toLowerCase() === '/cancel'|| text.toLowerCase() === 'cancel') {
            await ctx.reply("The operation has been cancelled.");
            return; // Cnacel Operation if cancel is written
          }
          if (text.toLowerCase() === 'done'|| text.toLowerCase() === 'Done') {
            break; // Exit the loop when the user types 'done'
          }
          pdfTextDescriptions.push(text);
          await ctx.reply("If you have completed your input, please type 'done' to continue.");
        }
      }
      await ctx.reply('Please provide the desired filename for the PDF file.');
      let output = await conversation.wait();
      const outputStr = output.message.text;
      let pdfFileName ="";
      if (!outputStr.includes(".pdf"))
      {
        pdfFileName = outputStr + ".pdf";
      }
      else{
        pdfFileName = outputStr;
      }
      console.log("PDF file name ")+pdfFileName;
      
      let textDescription="";
      for (let i = 0; i < pdfTextDescriptions.length; i++) {
         textDescription += pdfTextDescriptions[i];
      }

      console.info("PDF generation input " + pdfTextDescriptions);

      await ctx.reply('Creating a PDF for your text. Please wait.');

      createPDF(textDescription, pdfFileName);

      await ctx.reply('Thank you for using our service! To support our server costs and further development, please consider donating. Click on the link: [Donate via PayPal](https://www.paypal.com/donate/?hosted_button_id=PV7HABMM9S54S)', { parse_mode: 'Markdown' });  


async function createPDF(pdfText, filename) {
        const paragraphs = pdfText.split('\n');

          // Define styles
          const styles = {
            header: { fontSize: 20, alignment: 'center', margin: [0, 0, 0, 20] },
            paragraph: {
              fontSize: 12,
              margin: [0, 0, 0, 10],
              lineHeight: 1.25, // Adjust the value for the desired space between lines
            },
          };
        // Build the content array
        const content = [];
        paragraphs.forEach((paragraph) => {
          content.push({ text: paragraph, style: 'paragraph' });
        });
      
        // Create the document definition
        const documentDefinition = {
          content: content,
          styles: styles,
        };
        console.log("Generating pdf");
        pdfMake.vfs = pdfFonts.pdfMake.vfs;

        try {
          // Create the PDF
          const pdfDoc = pdfMake.createPdf(documentDefinition);
          const buffer = await new Promise((resolve, reject) => {
            pdfDoc.getBuffer((buffer) => {
              resolve(buffer);
            });
          });
    
          fs.writeFileSync(filename, buffer);
          console.info(`PDF  generation completed. File saved as ${filename}`);
          await ctx.replyWithDocument(new InputFile(filename));
        } catch (error) {
          console.error("Error while generating and sending the PDF:", error);
          // Handle the error and possibly send an error message to the user
        }
      }

    } catch (error) {
      console.info(error.stack); // Log the error, including the stack trace
      await ctx.reply("Sorry, there was an error generating the pdf file" + error.message);
    }
  }
};