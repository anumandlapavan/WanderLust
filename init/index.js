const mongoose = require("mongoose");
const initData = require("./data.js");

const Listing = require("../models/listingModel.js");

let dbUrl = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "675d152d9904fa0a9bcd869c",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data was initialised");
};

initDB();
