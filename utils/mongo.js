const mongoose = require("mongoose");

module.exports = {
  connectDatabase: async function () {
    try {
      console.log("Attempting DB connection..");
      await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connection established...`);
    } catch (err) {
      console.error(err);
      console.error("Failed to connect to mongodb");
      process.exit(1);
    }
  },
};
