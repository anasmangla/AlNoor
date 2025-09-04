const express = require("express");
const router = express.Router();

// Admin dashboard endpoints
router.get("/", (req, res) => res.send("Admin dashboard placeholder"));
router.post("/products", (req, res) => res.send("Add product placeholder"));

module.exports = router;

