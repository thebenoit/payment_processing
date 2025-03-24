import mongoose  from "mongoose";
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  firstName: { type: Schema.Types.String },
  lastName: { type: Schema.Types.String },
  phone: { type: Schema.Types.String },
  email: { type: Schema.Types.String },
  priceId: {type: Schema.Types.String, required: false},
  hasAccess: {type: Schema.Types.Boolean, default: false},
  password: { type: Schema.Types.String },
  preferencesId: { type: Schema.Types.ObjectId },
  accessToken: { type: Schema.Types.String },
  customerId: {type: Schema.Types.String, required: false},
  notifHistory: [{ type: Schema.Types.String, required: false }],
  date: { type: Schema.Types.Date },
});

const Users = mongoose.model("users", usersSchema, "users");

export default Users;
