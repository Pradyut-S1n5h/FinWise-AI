const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    income: Number,
    expenses: Number,
    creditScore: Number,
    disposableIncome: Number,
    eligible: Boolean,
    reason: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Loan", loanSchema);