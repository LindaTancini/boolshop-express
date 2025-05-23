//Express
const express = require("express");
const app = express();
const port = 3000;

//HomePage
app.get("/", (req, res) => {
  res.send("Homepage della Webapp!");
});

// Avvio server
app.listen(port, () => {
  console.log(`Sono un server attivo sulla porta:${port}`);
});
