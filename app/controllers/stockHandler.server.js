'use strict';

var Stock = require('../model/stocks.js');

function stockHandler() {
    
    var stock = new Stock();
    
    this.getList = function(req, res) {
        Stock.find({}, {_id: false}).select('stockSymbol companyName').exec(function(err, results) {
            if (err) throw err;
            //console.log(`results: ${results}`);
            if (results.length === 0) {
               res.json({});
            } else {
                res.json(results);
            }
        });
    };
    
    this.addStock = function(ticker, name) {
        Stock.findOne({stockSymbol: ticker}, {_id: false}).exec(function(err, result) {
            if (err) throw err;
            
            if (result) {
                console.log("Stock already exists");
                return "Stock Already Exists";
            } else {
                var newStock = new Stock();
                newStock.stockSymbol = ticker;
                newStock.companyName = name;
                newStock.save(function(err) {
                    if (err) throw err;
                    
                    console.log("Stock Saved");
                    return "Success";
                })
            }
        })
        
    }
    
    this.createStock = function(req, res) {
        console.log(req.body);
        var ticker = req.body.stockSymbol;
        
        Stock.findOne({stockSymbol: ticker}, {_id: false}).exec(function(err, result) {
            if (err) throw err;
            
            if (result) {
                console.log("Stock already exists");
                return "Stock Already Exists";
            } else {
                var newStock = new Stock();
                newStock.stockSymbol = req.body.stockSymbol;
                newStock.companyName = req.body.companyName;
                newStock.save(function(err) {
                    if (err) throw err;
                    
                    console.log("Stock Saved");
                    res.json({"status": "Success"});
                })
            }
        })
        
    }
    
    this.removeStock = function(req, res) {
        var ticker = req.params.id;
        console.log(`delete stock: ${ticker}`);
        Stock.remove({stockSymbol: ticker}).exec(function(err) {
            if (err) throw err;
            console.log("Stock Removed");
            res.json({status: "Success"});
        })
        
    }
}

module.exports = stockHandler;