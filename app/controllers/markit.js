/** 
 * Version 2.0
 */
var Markit = {};
var seriesOptions = [];
var seriesCounter = 0;

/**
 * Define the InteractiveChartApi.
 * First argument is symbol (string) for the quote. Examples: AAPL, MSFT, JNJ, GOOG.
 * Second argument is duration (int) for how many days of history to retrieve.
 */
Markit.InteractiveChartApi = function(symbols,duration){
    this.duration = duration;
    this.PlotChart(symbols);
};

Markit.InteractiveChartApi.prototype.PlotChart = function(symbols){
    var counter = 0;
    seriesCounter = 0;
    
    for (let k=0; k<seriesOptions.length; k++) {
        if (seriesOptions[k].data.length === 0) {
            counter++;
        }
    }
    
    if (counter > 0) {
        for (let i=0; i<seriesOptions.length; i++) {
           if (seriesOptions[i].data.length===0) {
               
                this.symbol = seriesOptions[i].name;
                var params = {
                    parameters: JSON.stringify( this.getInputParams() )
                }
            
                //Make JSON request for timeseries data
                $.ajax({
                    beforeSend:function(){
                        $("#chartDemoContainer").text("Loading chart...");
                    },
                    data: params,
                    url: "http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp",
                    dataType: "jsonp",
                    context: this,
                    success: function(json){
                        //Catch errors
                        if (!json || json.Message){
                            console.error("Error: ", json.Message);
                            $("#chartDemoContainer").text("An error occured loading the chart.");
                            return;
                        }
                        var ohlc = this._getOHLC(json);
                        
                        seriesOptions[i].data = ohlc;
        
                        seriesCounter++;
        
                        if (seriesCounter === counter) {
                            this.render(json);
                        }
                    },
                    error: function(response,txtStatus){
                        console.log(response,txtStatus)
                    }
                });
            } 
        }
    } else {
        console.log(`seriesOptions: {seriesOptions}`);
        this.render({});
    }
};

Markit.InteractiveChartApi.prototype.getInputParams = function(){
    return {  
        Normalized: false,
        NumberOfDays: this.duration,
        DataPeriod: "Day",
        Elements: [
            {
                Symbol: this.symbol,
                Type: "price",
                Params: ["ohlc"] //ohlc, c = close only
            }
        ]
        //,LabelPeriod: 'Week',
        //LabelInterval: 1
    }
};

Markit.InteractiveChartApi.prototype._fixDate = function(dateIn) {
    var dat = new Date(dateIn);
    return Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
};

Markit.InteractiveChartApi.prototype._getOHLC = function(json) {
    var dates = json.Dates || [];
    var elements = json.Elements || [];
    var chartSeries = [];

    if (elements[0]){

        for (var i = 0, datLen = dates.length; i < datLen; i++) {
            var dat = this._fixDate( dates[i] );
            var pointData = [
                dat,
                elements[0].DataSeries['open'].values[i],
                elements[0].DataSeries['high'].values[i],
                elements[0].DataSeries['low'].values[i],
                elements[0].DataSeries['close'].values[i]
            ];
            chartSeries.push( pointData );
        };
    }
    return chartSeries;
};

Markit.InteractiveChartApi.prototype._getVolume = function(json) {
    var dates = json.Dates || [];
    var elements = json.Elements || [];
    var chartSeries = [];

    if (elements[1]){

        for (var i = 0, datLen = dates.length; i < datLen; i++) {
            var dat = this._fixDate( dates[i] );
            var pointData = [
                dat,
                elements[1].DataSeries['volume'].values[i]
            ];
            chartSeries.push( pointData );
        };
    }
    return chartSeries;
};

Markit.InteractiveChartApi.prototype.render = function(data) {

    // create the chart
    $('#chartDemoContainer').highcharts('StockChart', {
        
        rangeSelector: {
            selected: 4
        },

        yAxis: {
            labels: {
                formatter: function () {
                    
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },

        series: seriesOptions
    });
};