const { OpenAI } = require("openai");

module.exports = {
  name: "coverletter",
  description: "Generate a random cover letter response",
  usage: "/coverletter",
  example: "/coverletter",
  category: "Cover Letter",
  handler: async (ctx) => {    
    try {
      // Create an instance of the OpenAI API
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_TOKEN // This is also the default, can be omitted
      });

      //const chatId = ctx.chat.id;
      await ctx.reply('Welcome! Please enter the job posting description.');

      // Start a conversation
     // const conversation = ctx.conversation("coverletter_chat");
   //  await conversation.enter("coverletter_chat");

      // Wait for the user to send the job posting description
      const userResponse = await ctx.conversation.wait();
      
      if (!userResponse || !userResponse.text) {
        await ctx.reply('Invalid job posting description. Please try again.');
        return;
      }

      const jobPostingDescription = userResponse.text;

      // Define the parameters for generating a completion
      const response = await openai.chat.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that writes cover letters.' },
          { role: 'user', content: jobPostingDescription },
          { role: 'assistant', content: `Write a cover letter: ${jobPostingDescription}` },
        ],
      });

      // Get the generated cover letter from the API response
      const coverLetter = response.data.choices[0].message.content;

      // Reply with the generated cover letter
      await ctx.reply(coverLetter);
    } catch (error) {
      console.info(error.stack); // Log the error, including the stack trace
      await ctx.reply("Sorry, there was an error generating the cover letter: " + error.message);
    }
  },
};