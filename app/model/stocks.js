'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stock = new Schema({
    stockSymbol: String,
    companyName: String
});

module.exports = mongoose.model('Stock', stock);