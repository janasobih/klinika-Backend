const mongoose = require("mongoose");

exports.connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DB_URL);
    console.log("database is connected");
  } catch (error) {
    console.log(`error : ${error.message}`);
  }
};
