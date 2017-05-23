var express = require('express');
var app = express();
var http = require('http');

var server = http.Server(app);
var io = require('socket.io')(server);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

require('dotenv').config();

app.use("/public", express.static(process.cwd() + "/public/"));
app.use("/controllers", express.static(process.cwd() + "/app/controllers/"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI);

var StockHandler = require('./app/controllers/stockHandler.server.js');

var stockHandler = new StockHandler();

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/public/index.html");
});

app.get("/api/stocks", stockHandler.getList);
app.post("/api/stock", stockHandler.createStock);
app.delete("/api/stock/:id", stockHandler.removeStock);

io.on('connection', function(socket) {
  console.log('a user has connected');
  
  
  socket.on('disconnect', function() {
    console.log('user disconnected');
  })
  
  socket.on('add stock', function(stock) {
    var stockUpper = stock.stock.toUpperCase();
    socket.broadcast.emit('add stock', {"stockSymbol" : stockUpper, "companyName": stock.name});
  })
  
  socket.on('remove stock', function(stock) {
    socket.broadcast.emit('remove stock', {"stockSymbol": stock});
  })
})

server.listen(process.env.PORT || 8080, function() {
    console.log("info: server is running");
})