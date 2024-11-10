const express = require("express");

const app = express();

app.get("/abs/:id", (req, res) => {
  console.log(req.params);
  res.send(req.params);
});

app.listen(4000, () => {
  console.log("server working at 4000");
});
