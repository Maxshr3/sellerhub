import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SellerHub API is running");
});

app.listen(3000, () => {
  console.log("MAIN FILE IS RUNNING");
});
