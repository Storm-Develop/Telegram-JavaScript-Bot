
module.exports = {
  name: "subscribe",
  description: "Join our channel @gethiredchannel for the latest GetHiredBot updates and provide feedback to help us improve.",
  usage: "/subscribe",
  example: "/subscribe",
  category: "Support",
  handler: async (ctx) => {           
    await ctx.reply(
      '📢 Looking for updates or keen to share feedback about GetHiredBot?\n'+
      'Subscribe to our official channel: @gethiredchannel!\n'+
      'Stay informed and help us shape the future of job hunting. 🚀'
  );
  }
};