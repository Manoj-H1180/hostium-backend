const mongoose = require("mongoose");

const DBInstance = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database connected ${connection.connection.host}`);
  } catch (error) {
    console.log(`Error connecting database : ${error}`);
    process.exit(1);
  }
};

module.exports = DBInstance;
