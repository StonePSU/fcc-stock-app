'use strict';

$(document).ready(function () {
  var socket = io();
  
  /*****************************************************************
                      DOM Functions
   *****************************************************************/
  // call internal api to get list of stocks stored in database
  $.getJSON(window.location.origin + "/api/stocks", function(data) {
    
    // for each stock returned from database, add a new list item
    $.each(data, function(index, obj) {
        var sym = obj.stockSymbol;
        var name = obj.companyName;
        stockList.push(sym);
        createStockElementUI(sym, name);
    });
    var markit = new Markit.InteractiveChartApi(stockList, 365);
    
  });
  
  $('form').submit(function(){
    var stock = $("#m").val().toUpperCase();
    var name = "";
    
    $.getJSON("http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp?callback=?&input=" + stock, function(data) {
        if (data && data.length > 0) {
            $.each(data, function(index, item) {
                if (item.Symbol === stock) {
                    name = item.Name;
                }
            });
            addStock(stock, name);
            socket.emit('add stock', {"stock": stock, "name": name});
        } else {
            alert("invalid stock");
        }
        
    });
    
    $('#m').val('');
    return false;
  });
  
  
  /***********************************************************
                      Socket Functions 
   ***********************************************************/
   
  socket.on('add stock', function(msg){
    stockList.push(msg.stockSymbol);
    createStockElementUI(msg.stockSymbol, msg.companyName);
    var markit = new Markit.InteractiveChartApi(stockList, 365);
    
    
  });
  
  socket.on('remove stock', function(msg){
    // remove the stock from the seriesOptions global
    var ind = -1;
    for (var j=0; j< seriesOptions.length; j++) {
        if (seriesOptions[j].name === msg.stockSymbol) {
            ind = j;
            return;
        }
    }
    
    seriesOptions.splice(ind, 1);
    deleteStockFromUI(msg.stockSymbol);
    var markit = new Markit.InteractiveChartApi(stockList, 365);
    
    
  });
  
});