const { OpenAI } = require("openai");

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
            
      await ctx.reply('Welcome! Please enter the job posting description, type *done* to continue.');

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
        }
      }
      console.info("Job Description" + jobDescriptions);

      await ctx.reply('Please enter your resume. When you have finished, type *done* to continue.');

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
        }
      }

      console.info("Resume Description" + resumeDescriptions);

      await ctx.reply('Generating cover letter, please wait.');

      // Define the parameters for generating a completion
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that writes cover letters.' },
          { role: 'user', content: `Job description: ${jobDescriptions}` },
          { role: 'user', content: `Resume: ${resumeDescriptions}` },
          { role: 'assistant', content: `Write a cover letter based on the job description and resume.` },
        ],
        max_tokens:500
      });
      console.log(response.choices);

      // Get the generated cover letter from the API response
      const coverLetter = response.choices[0].message.content;

      // Reply with the generated cover letter
      await ctx.reply(coverLetter);
    } catch (error) {
      console.info(error.stack); // Log the error, including the stack trace
      await ctx.reply("Sorry, there was an error generating the cover letter: " + error.message);
    }
  },
};