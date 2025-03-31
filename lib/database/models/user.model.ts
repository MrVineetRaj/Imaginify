import { Model, Schema, model, models } from "mongoose";

// Define the interface for User document
export interface IUser extends Document {
  _id: string;
  wallet_address: string;
  username?: string;
  // photo: string;
  first_name?: string;
  last_name?: string;
  plan_id?: number;
  credit_balance?: number;
}

const UserSchema = new Schema({
  wallet_address: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  plan_id: {
    type: Number,
    default: 1,
  },
  credit_balance: {
    type: Number,
    default: 10,
  },
});

const User:Model<IUser> = models?.User || model<IUser>("User", UserSchema);

export default User;
