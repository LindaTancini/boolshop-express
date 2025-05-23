//Express
const express = require("express");
const app = express();
const port = 3000;
const errorHandler = require('./middlewares/errorHandler.js');
const notFound = require('./middlewares/notFound.js');

//HomePage
app.get("/", (req, res) => {
  res.send("Homepage della Webapp!");
});

// middleware errori
app.use(errorHandler);

// middleware rotte non trovate
app.use(notFound);

// Avvio server
app.listen(port, () => {
  console.log(`Sono un server attivo sulla porta:${port}`);
});
