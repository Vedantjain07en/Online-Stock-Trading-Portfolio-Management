const router = require("express").Router();
const Stock = require("../models/Stock");

router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const filter = search ? { $or: [
      { symbol: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } }
    ] } : {};
    const stocks = await Stock.find(filter).sort({ symbol: 1 });
    res.json(stocks);
  } catch { res.status(500).json({ message: "Could not load stocks." }); }
});

module.exports = router;