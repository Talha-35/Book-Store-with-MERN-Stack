
const express = require("express");
const app = express();

const port = process.env.PORT || 5001

require("dotenv").config();

const connectDB = require("./models/connectDB");
const router = require("./routes/router");

connectDB();

app.use(express.json());
app.use("/api", router);

app.listen(port, () => {
  console.log(`I'm listening on port ${port}`);
});
