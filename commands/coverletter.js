const { Configuration, OpenAIApi } = require("openai");

// Replace with your OpenAI API key
const openaiApiKey = process.env.OPENAI_TOKEN;

module.exports = {
  name: "coverletter",
  description: "Generate a random cover letter response",
  usage: "/coverletter",
  example: "/coverletter",
  category: "Cover Letter",
  handler: async (ctx) => {
    const { message } = ctx;

    try {
      // Define the user's request (you can customize this prompt)
      const userRequest = "I am applying for the position of software developer.";
     
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_TOKEN,
      });
      // Create an instance of the OpenAI API
      const openai = new OpenAIApi(configuration);

      // Define the parameters for generating a completion
      const params = {
        engine: "davinci",
        prompt: `Write a cover letter: ${userRequest}`,
        temperature: 0.7, // Adjust for randomness
        max_tokens: 150, // Adjust for length
      };

      // Generate a cover letter using OpenAI's GPT-3
      const response = await openai.createCompletion(params);

      // Get the generated cover letter from the API response
      const coverLetter = response.choices[0].text;

      // Reply with the generated cover letter
      await ctx.reply(coverLetter);
    } catch (error) {
      console.info(error.stack); // Log the error, including the stack trace
      await ctx.reply("Sorry, there was an error generating the cover letter: " + error.message);
    }
  },
};