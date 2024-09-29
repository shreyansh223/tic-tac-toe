const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  wins: { type: Number, default: 0 },
  lose: { type: Number, default: 0 },
  draw: { type: Number, default: 0 },
});

const UserModel = model('User', UserSchema);
module.exports = UserModel;
