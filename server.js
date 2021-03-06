
const express = require("express");
const app = express();

const port = process.env.PORT || 5001

require("dotenv").config();

const connectDB = require("./models/connectDB");
const router = require("./routes/router");

connectDB();

app.use(express.json());
app.use("/api", router);


//PRODUCTİON

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"))
// bu kısmı react yani client kısmını görsün diye yaptık
app.get("*", (req,res) =>{
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
})
}

app.listen(port, () => {
  console.log(`I'm listening on port ${port}`);
});
