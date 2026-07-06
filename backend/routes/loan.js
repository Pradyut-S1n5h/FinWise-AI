const express = require("express");
const router = express.Router();
const Loan = require("../models/Loan");

router.post("/", async (req, res) => {
    const { income, expenses, creditScore } = req.body;

    const disposableIncome = income - expenses;

    let eligible = false;
    let reason = "";

    if (income >= 30000 && disposableIncome >= 10000 && creditScore >= 650) {
        eligible = true;
        reason = "Congratulations! You are eligible for the loan.";
    } else {
        reason = "Sorry! You are not eligible for the loan.";
    }

    const loan = new Loan({
        income,
        expenses,
        creditScore,
        disposableIncome,
        eligible,
        reason
    });

    await loan.save();

    res.json({
        eligible,
        disposableIncome,
        reason
    });
});

module.exports = router;