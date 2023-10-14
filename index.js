const { Bot, GrammyError, HttpError } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

if (fs.existsSync(".env")) {
  require("dotenv").config();
}
const openaiApiKey = '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';
const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  throw new Error("BOT_TOKEN is not set in environment variables! Exiting...");
}

async function start() {
  const bot = new Bot(botToken);
  bot.use(autoQuote);

  const commandFilesDir = path.resolve(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandFilesDir)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(commandFilesDir, file));
    bot.command(command.name, async (ctx) => {
      await command.handler(ctx);
    });

    if (command.alias) {
      for (const alias of command.alias) {
        bot.command(alias, async (ctx) => {
          await command.handler(ctx);
        });
      }
    }
  }

  // bot.command("start", (ctx) =>
  //   ctx.reply("Hello!\n\n" + "Run the /help command to see what I can do!")
  // );

  bot.command("start", (msg) => {
    bot.sendMessage(msg.chat.id, 'Welcome to the Cover Letter Generator bot! Please send me some information to get started.');
  });

  bot.command("help", (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'You can start by sending me information about the job you are applying for.');
  });

  bot.command("coverletter", (msg) => {
    const chatId = msg.chat.id;
    const userInput = msg.text;
  
    // Generate a cover letter using GPT-3
    axios.post('https://api.openai.com/v1/engines/text-davinci-002/completions', {
      prompt: `Write a cover letter for a job application: ${userInput}`,
      max_tokens: 150,
    }, {
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      }
    })
      .then((response) => {
        const coverLetter = response.data.choices[0].text;
        bot.api.sendMessage(chatId, coverLetter);
      })
      .catch((error) => {
        console.error(error);
        bot.api.sendMessage(chatId, 'Sorry, I encountered an error while generating the cover letter.');
      });
  });
  
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

  process.on("uncaughtException", (err) => {
    console.error(err);
  });

  process.on("unhandledRejection", (err) => {
    console.error(err);
  });

  process.on("SIGINT", () => {
    console.log("Stopping...");
    bot.stop();
    process.exit(0);
  });

  console.log("Starting the bot...");
  await bot.start();
}

start().catch((error) => {
  console.error("Error occurred during bot startup:", error);
  process.exit(1);
});
