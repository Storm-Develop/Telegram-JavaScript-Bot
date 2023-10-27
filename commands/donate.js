const fs = require('fs');
const {InputFile } = require('grammy');
const pdfMake = require('pdfmake/build/pdfmake')
const pdfFonts = require('pdfmake/build/vfs_fonts');

module.exports = {
  name: "donate",
  description: "Please support the chatbot to help manage server expenses & help with further development.",
  usage: "/donate",
  example: "/donate",
  category: "Create PDF",
  handler: async (ctx) => {           
    await ctx.reply('Thank you for using our service! To support our server costs and further development, please consider donating. Click on the link: [Donate via PayPal](https://www.paypal.com/donate/?hosted_button_id=PV7HABMM9S54S)', { parse_mode: 'MarkdownV2' });  
  }
};