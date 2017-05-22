'use strict';

var stockList = [];

function addStock(stockSymbol, companyName, buildChart) {
    var upper = stockSymbol.toUpperCase();
    
    $.ajax({
        url: window.location.origin + "/api/stock",
        type: "POST",
        data: {
            stockSymbol: stockSymbol,
            companyName: companyName
        },
        success: function(result) {
            if (result.status === "Success") {
                stockList.push(upper);
                createStockElementUI(upper, companyName);
                var markit = new Markit.InteractiveChartApi(stockList, 365);
            }
        }
    })
}

function removeStock(stockSymbol) {
    var upper = stockSymbol.toUpperCase();
    
    $.ajax({
        url: window.location.origin + "/api/stock/" + upper,
        type: "DELETE",
        success: function(result) {
            if (result.status === "Success") {
                // remove stock from global array
                var index = stockList.indexOf(upper);
                if (index !== -1) {
                    var removed = stockList.splice(index, 1);
                }
                
                // remove the stock from the seriesOptions global
                var ind = -1;
                for (var j=0; j< seriesOptions.length; j++) {
                    if (seriesOptions[j].name === upper) {
                        ind = j;
                        break;
                    }
                }
                
                seriesOptions.splice(ind, 1);
                
                // remove the value from the ui
                deleteStockFromUI(upper);
                
                // redraw the chart
                var markit = new Markit.InteractiveChartApi(stockList, 365);
                
            }
        }
    })
    
}

function createStockElementUI(symbol, name) {
    var message = document.getElementById("messages");
    // create span element
    var span = document.createElement("span");
    span.setAttribute("class", "remove");
    var spanNode = document.createTextNode("X");
    span.appendChild(spanNode);
    span.addEventListener("click", clickRemove, false);
    
    // create list item
    var li = document.createElement("li");
    li.innerHTML = "<span class='symbol'>" + symbol + "</span>" + "<br>" + name;
    li.appendChild(span);
    // insert list item into DOM
    message.appendChild(li);
}
function clickRemove() {
    var socket = io();
    var symbol = this.parentNode.firstChild.innerHTML;
    removeStock(symbol);
    socket.emit('remove stock', symbol);
}

function deleteStockFromUI(symbol) {
    
    var el = document.getElementById("messages");
    var children = el.childNodes;
    
    // find the appropriate list item corresponding to the deleted stock and remove it
    for (var i=0; i<children.length; i++) {
        var currNode = children[i];
        if (currNode.nodeName === "LI" && currNode.childNodes[0].firstChild.nodeValue === symbol) {
            el.removeChild(currNode);
        }
    }
}