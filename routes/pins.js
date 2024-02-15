const mongoose = require("mongoose");


const pinSchema = mongoose.Schema({
  user: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  title: {
    type: String,
    required: true,
    // unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  image:String
});

module.exports = mongoose.model("post", pinSchema);
