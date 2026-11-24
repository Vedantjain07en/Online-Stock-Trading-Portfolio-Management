const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Stock = require("../models/Stock");
const Holding = require("../models/Holding");
const Transaction = require("../models/Transaction");

router.use(auth);

router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    const holdings = await Holding.find({ user: req.userId }).populate("stock");
    const transactions = await Transaction.find({ user: req.userId }).sort({ createdAt: -1 }).limit(20);
    const portfolio = holdings.map(h => {
      const currentPrice = h.stock ? h.stock.price : h.averageBuyPrice;
      const invested = h.quantity * h.averageBuyPrice;
      const currentValue = h.quantity * currentPrice;
      return { ...h.toObject(), currentPrice, invested, currentValue, profitLoss: currentValue - invested };
    });
    res.json({ user, holdings: portfolio, transactions });
  } catch { res.status(500).json({ message: "Could not load portfolio." }); }
});

router.post("/trade", async (req, res) => {
  try {
    const { symbol, type, quantity } = req.body;
    const qty = Number(quantity);
    if (!symbol || !["BUY", "SELL"].includes(type) || !Number.isInteger(qty) || qty < 1)
      return res.status(400).json({ message: "Enter a valid stock, trade type and whole-number quantity." });

    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) return res.status(404).json({ message: "Stock not found." });

    const user = await User.findById(req.userId);
    const total = Number((stock.price * qty).toFixed(2));
    let holding = await Holding.findOne({ user: req.userId, stock: stock._id });

    if (type === "BUY") {
      if (user.cashBalance < total) return res.status(400).json({ message: "Insufficient virtual cash balance." });
      const oldQty = holding ? holding.quantity : 0;
      const oldCost = holding ? oldQty * holding.averageBuyPrice : 0;
      if (!holding) holding = new Holding({ user: req.userId, stock: stock._id, symbol: stock.symbol, company: stock.company, quantity: 0, averageBuyPrice: 0 });
      holding.quantity = oldQty + qty;
      holding.averageBuyPrice = (oldCost + total) / holding.quantity;
      user.cashBalance = Number((user.cashBalance - total).toFixed(2));
      await holding.save();
    } else {
      if (!holding || holding.quantity < qty) return res.status(400).json({ message: "You do not own enough shares to sell." });
      holding.quantity -= qty;
      user.cashBalance = Number((user.cashBalance + total).toFixed(2));
      if (holding.quantity === 0) await holding.deleteOne();
      else await holding.save();
    }

    await user.save();
    await Transaction.create({ user: req.userId, stock: stock._id, symbol: stock.symbol, type, quantity: qty, price: stock.price, total });
    res.json({ message: `${type} order completed in simulation.`, cashBalance: user.cashBalance });
  } catch (err) {
    res.status(500).json({ message: "Trade could not be completed." });
  }
});

module.exports = router;