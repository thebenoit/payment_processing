import mongoose from "mongoose";

import dotenv from "dotenv/config";

console.log("DB_URI", process.env.DB_URI);
const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };
//connection à la bd
mongoose
  .connect(process.env.DB_URI, dbOptions)
  .then(() => console.log(mongoose.modelNames(), "DB Connected"))
  .catch((err) => console.log(err));

export default mongoose;
