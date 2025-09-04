const express = require("express");
const router = express.Router();

// Storefront endpoints
router.get("/", (req, res) => res.send("Storefront placeholder"));
router.get("/products", (req, res) => res.send("List products placeholder"));

module.exports = router;

