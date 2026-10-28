
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to round amounts to 2 decimal places
function roundAmount(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}


// Calculate trading fees
app.post("/api/calculate-fee", (req, res) => {
  try {
    const { tradeAmount, buyFeeRate, sellFeeRate } = req.body;

    // Validate required fields
    if (
      tradeAmount === undefined ||
      buyFeeRate === undefined ||
      sellFeeRate === undefined ||
      tradeAmount === "" ||
      buyFeeRate === "" ||
      sellFeeRate === ""
    ) {
      return res.status(400).json({
        success: false,
        error: "Please provide the trade amount and both fee rates.",
      });
    }

    // Convert input values to numbers
    const amount = Number(tradeAmount);
    const buyingRate = Number(buyFeeRate);
    const sellingRate = Number(sellFeeRate);

    // Validate numeric values
    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(buyingRate) ||
      !Number.isFinite(sellingRate)
    ) {
      return res.status(400).json({
        success: false,
        error: "All inputs must be valid numbers.",
      });
    }

    // Validate trade amount and fee rates
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Trade amount must be greater than zero.",
      });
    }

    if (
      buyingRate < 0 ||
      buyingRate > 100 ||
      sellingRate < 0 ||
      sellingRate > 100
    ) {
      return res.status(400).json({
        success: false,
        error: "Fee rates must be between 0 and 100.",
      });
    }

    // Calculate buying and selling fees
    const buyingFee = roundAmount((amount * buyingRate) / 100);
    const sellingFee = roundAmount((amount * sellingRate) / 100);

    // Calculate total fees and final amounts
    const totalTradingFee = roundAmount(buyingFee + sellingFee);
    const buyTotal = roundAmount(amount + buyingFee);
    const sellNet = roundAmount(amount - sellingFee);

    // Send response to frontend
    return res.status(200).json({
      tradeAmount: amount,
      buyFeeRate: buyingRate,
      sellFeeRate: sellingRate,
      buyingFee,
      sellingFee,
      totalTradingFee,
      buyTotal,
      sellNet,
    });
  } catch (error) {
    console.error("Fee calculation error:", error);

    return res.status(500).json({
      success: false,
      error: "An internal server error occurred.",
    });
  }
});

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API route not found.",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`FeeWise backend running at http://localhost:${PORT}`);
});
