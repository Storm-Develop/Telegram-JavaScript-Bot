const {OpenAI } = require("openai");


module.exports = {
  name: "coverletter",
  description: "Generate a random cover letter response",
  usage: "/coverletter",
  example: "/coverletter",
  category: "Cover Letter",
  handler: async (ctx) => {
    const { message } = ctx;

    try {

      const chatId = ctx.chat.id;
      await ctx.reply('Welcome! Please enter the job posting description.');

      // Wait for the user to send the job posting description
      const { userResponse } = await conversation.wait();
      if (!userResponse || !userResponse.text) {
        await ctx.reply('Invalid job posting description. Please try again.');
        return;
      }

      const jobPostingDescription = userResponse.text;

      // Define the user's request (you can customize this prompt)
     // const userRequest = "I am applying for the position of software developer.";
     
      // Create an instance of the OpenAI API
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_TOKEN // This is also the default, can be omitted
      });
      // Define the parameters for generating a completion


      // Generate a cover letter using OpenAI's GPT-3
      //const response = await openai.chat.completions.create(params);
      const response = await openai.chat.completions.create({
        messages: [
        {role: "user", content: jobPostingDescription },
        {role: "system", content: "You are a helpful assistant that writes cover letters." },
        { role: "assistant", content: `Write a cover letter: ${jobPostingDescription}` }],
         model: 'gpt-3.5-turbo',max_tokens:50
      });
      // Get the generated cover letter from the API response
      const coverLetter = response.choices[1].message;

      // Reply with the generated cover letter
      await ctx.reply(coverLetter);
    } catch (error) {
      console.info(error.stack); // Log the error, including the stack trace
      await ctx.reply("Sorry, there was an error generating the cover letter: " + error.message);
    }
  },
};