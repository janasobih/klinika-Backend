// const mongoose = require("mongoose");

// exports.connectDB = async () => {
//   try {
//     const connection = await mongoose.connect(process.env.DB_URL);
//     console.log("database is connected");
//   } catch (error) {
//     console.log(`error : ${error.message}`);
//   }
// };

const mongoose = require("mongoose");

let isConnected = false;

exports.connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.DB_URL);

    isConnected = true;

    console.log("Database is connected");
  } catch (error) {
    console.log(`Database connection error: ${error.message}`);
    throw error;
  }
};
