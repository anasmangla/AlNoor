const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/assets", express.static(path.join(__dirname, "../assets")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Placeholder routes
app.use("/admin", require("./routes/admin"));
app.use("/pos", require("./routes/pos"));
app.use("/store", require("./routes/store"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Al Noor Farm server running at http://localhost:${PORT}`));

