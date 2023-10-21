const { OpenAI } = require("openai");
const fs = require('fs');
const {InputFile } = require('grammy');
const pdfMake = require('pdfmake/build/pdfmake')
const pdfFonts=require('pdfmake/build/vfs_fonts')


module.exports = {
  name: "coverletter",
  description: "Generate a cover letter response using your resume as a reference.",
  usage: "/coverletter",
  example: "/coverletter",
  category: "Cover Letter",
  handler: async (conversation,ctx) => {    
    try {
      // Create an instance of the OpenAI API
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_TOKEN // This is also the default, can be omitted
      });

      // await ctx.reply('Welcome! Please enter the job posting description.');

      // Start a conversation

      // Wait for the user to send the job posting description
      // const userResponse  = await conversation.wait();
      // if (!userResponse || !userResponse.message || !userResponse.message.text) {
      //   await ctx.reply('Invalid job posting description. Please try again.');
      //   return;
      // }
      // console.info(userResponse.message);

      // const jobPostingDescription = userResponse.message.text;
            
      await ctx.reply('Welcome! Please enter the job posting description.');

      const jobDescriptions = [];

      while (true) {
        const jobDescriptionResponse = await conversation.wait();
      
        if (!jobDescriptionResponse || !jobDescriptionResponse.message || !jobDescriptionResponse.message.text) {
          await ctx.reply('Invalid job description. Please try again.');
        } else {
          const text = jobDescriptionResponse.message.text;
          if (text.toLowerCase() === 'done'|| text.toLowerCase() === 'Done') {
            break; // Exit the loop when the user types 'done'
          }
          jobDescriptions.push(text);
          await ctx.reply("If you have completed your input, please type 'done' to continue.");
        }
      }
      console.info("Job Description " + jobDescriptions);

      await ctx.reply('Please enter your resume.');

      const resumeDescriptions = [];

      while (true) {
        const resumeResponse = await conversation.wait();
      
        if (!resumeResponse || !resumeResponse.message || !resumeResponse.message.text) {
          await ctx.reply('Invalid resume description. Please try again.');
        } else {
          const text = resumeResponse.message.text;
          if (text.toLowerCase() === 'done'|| text.toLowerCase() === 'Done') {
            break; // Exit the loop when the user types 'done'
          }
          resumeDescriptions.push(text);
          await ctx.reply("If you have completed your input, please type 'done' to continue.");
        }
      }

      console.info("Resume Description " + resumeDescriptions);

      await ctx.reply('Generating the cover letter. Please wait');

      // Define the parameters for generating a completion
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that writes cover letters.' },
          { role: 'user', content: `Job description: ${jobDescriptions}` },
          { role: 'user', content: `Resume: ${resumeDescriptions}` },
          { role: 'assistant', content: `Write a cover letter based on the job description and resume.` },
        ],
        max_tokens:50
      });
      console.log(response.choices);

      // Get the generated cover letter from the API response
      const coverLetter = response.choices[0].message.content;
      
      // Reply with the generated cover letter
      await ctx.reply(coverLetter);

      createCoverLetterPDFv2(coverLetter, "CoverLetter_Test.pdf");

      await ctx.reply('Creating a PDF for your cover letter. Please wait.');

async function createCoverLetterPDFv2(coverLetterText, filename) {
        const paragraphs = coverLetterText.split('\n\n');

          // Define styles
        const styles = {
          header: { fontSize: 20, alignment: 'center', margin: [0, 0, 0, 20] },
          paragraph: { fontSize: 12, margin: [0, 0, 0, 10] },
        };
        // Build the content array
        const content = [];
        //content.push({ text: 'Cover Letter', style: 'header' });
        paragraphs.forEach((paragraph) => {
          content.push({ text: paragraph, style: 'paragraph' });
        });
        

        // Create the document definition
        const documentDefinition = {
          content: content,
          defaultStyle: {
            font: 'Arial', // Set the default font to 'Arial'
          },
          fonts: {
            Arial: {
              normal: 'Arial', // Define the 'normal' style for 'Arial' font
              bold: 'Arial-Bold', // Define the 'bold' style for 'Arial' font
              italics: 'Arial-Italic', // Define the 'italics' style for 'Arial' font
              bolditalics: 'Arial-Bold-Italic', // Define the 'bolditalics' style for 'Arial' font
            },
          },
          styles: styles,
        };
        console.log("Generating pdf");

        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        // Create the PDF
        const pdfDoc = pdfMake.createPdf(documentDefinition);

        try {
                // Save the PDF to a file
        pdfDoc.getBuffer((buffer) => {
          fs.writeFileSync(filename, buffer);
          console.info(`PDF Cover letter generation completed. File saved as ${filename}`);
        });

          await ctx.replyWithDocument(new InputFile(filename));
        } catch (error) {
          console.error("Error while generating and sending the PDF:", error);
          // Handle the error and possibly send an error message to the user
        }
      }

    } catch (error) {
      console.info(error.stack); // Log the error, including the stack trace
      await ctx.reply("Sorry, there was an error generating the cover letter: " + error.message);
    }


// async function createCoverLetterPDF(coverLetterText, filename) {
//   const pdfDoc = await PDFDocument.create();
//   const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  
//   // Standard page size (A4 size: 595 x 842 points)
//   const pageSize = [595, 842];
//   let currentPage = pdfDoc.addPage(pageSize);
//   let pageHeight = pageSize[1] - 50;
//   const fontSize = 11;
  
//   const lines = coverLetterText.split('\n');
  
//   for (let line of lines) {
//     if (pageHeight - fontSize < 0) {
//       // Create a new page if the remaining height is not enough
//       currentPage = pdfDoc.addPage(pageSize);
//       pageHeight = pageSize[1] - 50;
//     }
  
//     while (timesRomanFont.widthOfTextAtSize(line, fontSize) > pageSize[0] - 120) {
//       // If the text is too wide, split it into two lines
//       const textWidth = timesRomanFont.widthOfTextAtSize(line, fontSize);
//       const charsToFit = Math.floor((pageSize[0] - 120) / textWidth * line.length);
//       const line1 = line.substring(0, charsToFit);
//       const line2 = line.substring(charsToFit);
//       line = line1;
//       currentPage.drawText(line, {
//         x: 50,
//         y: pageHeight,
//         size: fontSize,
//         font: timesRomanFont,
//         color: rgb(0, 0, 0),
//       });
//       pageHeight -= fontSize;
//       line = line2;
//     }
  
//     currentPage.drawText(line, {
//       x: 50,
//       y: pageHeight,
//       size: fontSize,
//       font: timesRomanFont,
//       color: rgb(0, 0, 0),
//     });
  
//     pageHeight -= fontSize;
//   }

//         try {
//           const pdfBytes = await pdfDoc.save();
//           fs.writeFileSync(filename, pdfBytes);

//           console.info(`PDF Cover letter generation completed. File saved as ${filename}`);

//           await ctx.replyWithDocument(new InputFile(filename));
//         } catch (error) {
//           console.error("Error while generating and sending the PDF:", error);
//           // Handle the error and possibly send an error message to the user
//         }
//       }

//     } catch (error) {
//       console.info(error.stack); // Log the error, including the stack trace
//       await ctx.reply("Sorry, there was an error generating the cover letter: " + error.message);
//     }

  }
};