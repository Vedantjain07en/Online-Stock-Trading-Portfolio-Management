require("dotenv").config();
const mongoose = require("mongoose");
const Stock = require("../models/Stock");

const sampleStocks = [
  { symbol: "RELIANCE", company: "Reliance Industries", price: 1450, changePercent: 1.25, sector: "Energy" },
  { symbol: "TCS", company: "Tata Consultancy Services", price: 3820, changePercent: -0.45, sector: "IT" },
  { symbol: "INFY", company: "Infosys", price: 1780, changePercent: 0.82, sector: "IT" },
  { symbol: "HDFCBANK", company: "HDFC Bank", price: 1685, changePercent: 0.36, sector: "Banking" },
  { symbol: "ICICIBANK", company: "ICICI Bank", price: 1240, changePercent: -0.22, sector: "Banking" },
  { symbol: "ITC", company: "ITC Limited", price: 430, changePercent: 0.64, sector: "FMCG" },
  { symbol: "WIPRO", company: "Wipro", price: 295, changePercent: -0.18, sector: "IT" },
  { symbol: "SBIN", company: "State Bank of India", price: 820, changePercent: 1.05, sector: "Banking" }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    for (const stock of sampleStocks) {
      await Stock.findOneAndUpdate({ symbol: stock.symbol }, stock, { upsert: true, new: true });
    }
    console.log(`Seeded ${sampleStocks.length} sample stocks.`);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
seed();