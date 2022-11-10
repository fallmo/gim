const { model, Schema } = require("mongoose");

const schema = new Schema({
  long_url: { type: String, required: true },
  ref: { type: String, required: true },
  date_created: { type: Date, default: Date.now },
});

module.exports = model("link", schema);
