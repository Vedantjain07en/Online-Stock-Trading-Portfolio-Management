const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true },
  company: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  changePercent: { type: Number, default: 0 },
  sector: { type: String, default: "General" }
}, { timestamps: true });

module.exports = mongoose.model("Stock", stockSchema);