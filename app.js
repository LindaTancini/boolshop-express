//Express
require('dotenv').config();
const port = process.env.PORT || 3000;
const express = require('express');
const app = express();
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler.js');
const notFound = require('./middlewares/notFound.js');

//connection to routers
const albumRouter = require('./routers/routes.js');
const genreRouter = require('./routers/genres.js');
const artistRouter = require('./routers/artists.js');
const discountRouter = require('./routers/discount.js');
const paymentRouter = require('./routers/paymentRoutes.js');

//cors middleware
app.use(cors({
  origin: process.env.FE_APP
}));

//static middleware
app.use(express.static('public'));

//body parser
app.use(express.json());//req.body


//HomePage
app.get("/", (req, res) => {
  res.send("Homepage della Webapp!");
});


//route of album
app.use('/api/album', albumRouter);

//route of genre
app.use('/api/genres', genreRouter);

//route of author
app.use('/api/artists', artistRouter);


//route of discount
app.use('/api/discount', discountRouter);

//route of payment
app.use("/api/payment", paymentRouter);


// middleware errori
app.use(errorHandler);

// middleware rotte non trovate
app.use(notFound);

// Avvio server
app.listen(port, () => {
  console.log(`Sono un server attivo sulla porta:${port}`);
});
