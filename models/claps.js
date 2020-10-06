const mongoose = require("mongoose");

const clapSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    match: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  },
  hits: {
    type: Number,
    default: 1,
    required: false,
  },
  question: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Clap", clapSchema);
