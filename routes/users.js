const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
require("dotenv").config();

console.log(process.env.MONGODB_URL)

mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log('MongoDB connected successfully'))
.catch(error => console.error('MongoDB connection error:', error));

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
  },
  boards: {
    type: Array,
    default: [],
  },
  profileImage: String,
  posts:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"post"
    }
  ]
});

userSchema.plugin(plm);
module.exports = mongoose.model("user", userSchema);
