const cron = require("node-cron");
const User = require("../models/userModel");

const removeUnverifiedAccounts = () => {
  cron.schedule("*/30 * * * *", async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    try {
      const result = await User.deleteMany({
        accountVerified: false,
        createdAt: { $lt: thirtyMinutesAgo },
      });

      console.log(
        `Cleanup Task: ${result.deletedCount} unverified accounts removed.`
      );
    } 
    catch (error) {
      console.error("Error removing unverified accounts:", error);
    }
  });
};

module.exports = removeUnverifiedAccounts;
