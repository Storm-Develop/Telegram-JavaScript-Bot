const { Bot, GrammyError, HttpError, Context, session } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");
const { freeStorage } = require("@grammyjs/storage-free");
const coverletterCommand = require('./commands/coverletter');
const createPDFCommand = require('./commands/create_pdf');
const donateCommand = require('./commands/donate');
const helpCommand = require('./commands/help');
const subscribeCommand = require('./commands/subscribe');

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
  bot.use(conversations());
  bot.use(createConversation(coverletter_chat));
  bot.use(createConversation(create_pdf_chat));

  bot.command("cancel", async (ctx) => {
    await ctx.conversation.exit();
    await ctx.reply("The operation has been cancelled.");
  });

  bot.command("start", (ctx) => {
    ctx.reply(
      'Welcome to the GetHiredBot!\n\n' + 
      'I use the latest Open AI model to help you get your next position.\n\n' + 
      'Run the /help command to see what I can do!'
  );
});

  bot.command(subscribeCommand.name, async (ctx) =>{
    await subscribeCommand.handler(ctx);
  });

  bot.command(helpCommand.name, async (ctx) =>{
      await helpCommand.handler(ctx);
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