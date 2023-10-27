const { Bot, GrammyError, HttpError, Context, session } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");
const { freeStorage } = require("@grammyjs/storage-free");
const coverletterCommand = require('./commands/coverletter');
const createPDFCommand = require('./commands/create_pdf');
const donateCommand = require('./commands/donate');
const helpCommand = require('./commands/help');

const botToken = process.env.BOT_TOKEN;
const pdfMake = require('pdfmake');

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");

if (fs.existsSync(".env")) {
  require("dotenv").config();
}

if (!botToken) {
  throw new Error("BOT_TOKEN is not set in environment variables! Exiting...");
}

async function start() {
  const bot = new Bot(botToken);
  bot.use(autoQuote);
  bot.use(session({
    initial: () => ({ }),
    storage: freeStorage(botToken),
  }));
  //bot.use(session({ initial: createInitialSessionData }));
  bot.use(conversations());
  bot.use(createConversation(coverletter_chat));
  bot.use(createConversation(create_pdf_chat));

  // const commandFilesDir = path.resolve(__dirname, "commands");
  // const commandFiles = fs
  //   .readdirSync(commandFilesDir)
  //   .filter((file) => file.endsWith(".js"));

  // for (const file of commandFiles) {
  //   const command = require(path.join(commandFilesDir, file));
  //   bot.command(command.name, async (ctx) => {
  //     await command.handler(ctx);
  //   });

  //   if (command.alias) {
  //     for (const alias of command.alias) {
  //       bot.command(alias, async (ctx) => {
  //         await command.handler(ctx);
  //       });
  //     }
  //   }
  // }

  bot.command("cancel", async (ctx) => {
    await ctx.conversation.exit();
    await ctx.reply("Cancelling the operation.");
  });

  bot.command("start", (ctx) => {
    ctx.reply("Hello!\n\n" + "Run the /help command to see what I can do!");
});

  bot.command(helpCommand.name, async (ctx) =>{
      await donateCommand.handler(ctx);
   });

  // Register the coverletter command
  bot.command(coverletterCommand.name, async (ctx) => {
      await ctx.conversation.enter("coverletter_chat");
  });

  // Register the generate PDF command
  bot.command(createPDFCommand.name, async (ctx) => {
    await ctx.conversation.enter("create_pdf_chat");
  });

  bot.command(donateCommand.name, async (ctx) => {
    await donateCommand.handler(ctx);
  });

  /** Defines the conversation cover letter*/
  async function coverletter_chat(conversation, ctx) {
    await coverletterCommand.handler(conversation,ctx);
  }

    /** Defines the pdf generation chat*/
  async function create_pdf_chat(conversation, ctx) {
      await createPDFCommand.handler(conversation,ctx);
  }

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