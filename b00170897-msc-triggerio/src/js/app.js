// forge.enableDebug();

var navClick = function(){
  /* Cordova Test */
  $("#templates").load("templates/cordova-trigger-performance-test.html #content", function(){
    var template = document.getElementById('content').innerHTML;
    var output = Mustache.render(template, view);
    $("#container").html(output);
  });

  /* Weather Test */
  var view = {
    latitude : "55.843353",
    longitude : "-4.429053",
    weather: {
      date: '',
      temp: '',
      weather_type: '',
      hum: '',
      wind:''
    },
    retrievalTime: '0.00ms',
    processingTime: '0.00ms',
    outputTime: '0.00ms',
    totalTime: '0.00ms'
  };

  $("#templates").load("templates/q-vs-forgerequest-weather-test.html #content", function(){
    var template = document.getElementById('content').innerHTML;
    var output = Mustache.render(template, view);
    $("#container").html(output);
  });
};

/* promiseType parameter must be equal to 'forge' or 'nativeJS' */
var getWeather = function (pos, promiseType, callback) {
  var weatherData = {};
  var weatherReport = {};

  function siteListOnSuccess(data, pos, callback) {
    var lat, lng, closest, closest_id, locations, loc_id, nearby, output = [],
      standpoint;

    lat = pos.coords.latitude;
    lng = pos.coords.longitude;

    /* find-locations.js parseJSON() method puts the Met Office monitoring locations list in the format it needs */
    if( typeof data === 'string' ) data = JSON.parse(data); // With the native Javascript method the data just comes back as a string so we convert it to an object
    locations = parseJSON(data); // Despite the similar name this doesn't do the same as the above native JSON.parse() method

    // where you are
    standpoint = new Location(null, "Your location", lat, lng);

    // just interested in the closest location in the list
    closest = window.getNearest(standpoint, locations);
    //console.log(closest);
    closest_id = closest.location.id; // The Met Office site ID for the closest weather station used when querying the Met forecast service(s)

    var loading_msg = window.document.getElementsByClassName('weather-loading-message');
    if (loading_msg != null) {
      for (var i = 0; i < loading_msg.length; i++) {
        loading_msg[i].innerHTML = 'Getting weather...';
      }
    }

    // or perhaps the 5 closest
    // nearby = getNNearest(standpoint, locations, 5);

    // console.log('closest station', closest);
    // console.log('nearby locations', nearby);

    // Let's assign the closest station's ID to our "loc_id" variable to use in our wthrService forecast service(s) query in services.js
    loc_id = closest_id;

    /* Our function for a successful request that parses and outputs our weather data */
    function getForecastOnSuccess(forecastData, callback) {
      /* Return our weather data to the view */
      var wthrJSON = forecastData;
      weatherData.locData = {};
      weatherData.locData.currentDayReps = wthrJSON.SiteRep.DV.Location.Period[1]; // The hourly weather readings for the current day
      var latestRepKey = (typeof wthrJSON.SiteRep.DV.Location.Period[1].Rep.length == 'undefined') ? 1 : wthrJSON.SiteRep.DV.Location.Period[1].Rep.length; // The length of the weather reports array per 24 hour time minus one, e.g. 8PM/2000hrs = 19

      if (latestRepKey == 1) {
        weatherData.latestReport = wthrJSON.SiteRep.DV.Location.Period[1].Rep;
      }
      else {
        weatherData.latestReport = wthrJSON.SiteRep.DV.Location.Period[1].Rep[latestRepKey - 1];
      }

      weatherData.dataDate = wthrJSON.SiteRep.DV.dataDate; // The date the data requested is for
      weatherReport.dataDate = weatherData.dataDate;
      weatherData.Param = wthrJSON.SiteRep.Wx.Param; // Explanation for the parameters for each of the weather objects (hourly)
      //console.log(weatherData);

      /* Output our weather */
      weatherReport.temp = weatherData.latestReport.T + ' ' + weatherData.Param[1].units;


      /* Definitions from: http://www.metoffice.gov.uk/datapoint/support/documentation/code-definitions# */
      var weather_type_def = '';
      var weather_type_val = weatherData.latestReport.W;
      if (weather_type_val != 'NA') weather_type_val = Number(weather_type_val);

      switch (weather_type_val) {
        case 'NA':
          weather_type_def = 'Not available';
          break;

        case 0:
          weather_type_def = 'Clear night';
          break;

        case 1:
          weather_type_def = 'Sunny day';
          break;

        case 2:
          weather_type_def = 'Partly cloudy (night)';
          break;

        case 3:
          weather_type_def = 'Partly cloudy (day)';
          break;

        case 4:
          weather_type_def = 'Not used';
          break;

        case 5:
          weather_type_def = 'Mist';
          break;

        case 6:
          weather_type_def = 'Fog';
          break;

        case 7:
          weather_type_def = 'Cloudy';
          break;

        case 8:
          weather_type_def = 'Overcast';
          break;

        case 9:
          weather_type_def = 'Light rain shower (night)';
          break;

        case 10:
          weather_type_def = 'Light rain shower (day)';
          break;

        case 11:
          weather_type_def = 'Drizzle';
          break;

        case 12:
          weather_type_def = 'Light rain';
          break;

        case 13:
          weather_type_def = 'Heavy rain shower (night)';
          break;

        case 14:
          weather_type_def = 'Heavy rain shower (day)';
          break;

        case 15:
          weather_type_def = 'Heavy rain';
          break;

        case 16:
          weather_type_def = 'Sleet shower (night)';
          break;

        case 17:
          weather_type_def = 'Sleet shower (day)';
          break;

        case 18:
          weather_type_def = 'Sleet';
          break;

        case 19:
          weather_type_def = 'Hail shower (night)';
          break;

        case 20:
          weather_type_def = 'Hail shower (day)';
          break;

        case 21:
          weather_type_def = 'Hail';
          break;

        case 22:
          weather_type_def = 'Light snow shower (night)';
          break;

        case 23:
          weather_type_def = 'Light snow shower (day)';
          break;

        case 24:
          weather_type_def = 'Light snow';
          break;

        case 25:
          weather_type_def = 'Heavy snow shower (night)';
          break;

        case 26:
          weather_type_def = 'Heavy snow shower (day)';
          break;

        case 27:
          weather_type_def = 'Heavy snow';
          break;

        case 28:
          weather_type_def = 'Thunder shower (night)';
          break;

        case 29:
          weather_type_def = 'Thunder shower (day)';
              break;

            case 30:
              weather_type_def = 'Thunder';
              break;

            default:
              weather_type_def = 'Not available';
              break;
      }

      weatherReport.weather_type = weather_type_def;
      weatherReport.hum = weatherData.latestReport.H + weatherData.Param[9].units;
      weatherReport.wind = weatherData.latestReport.S + weatherData.Param[4].units + ' wind, ' + weatherData.latestReport.D;

      // We're done processing, let's take note!
      window.weather_timestamps.processingTime = performance.now();

      // return weatherData; <---- Raw report
      // return weatherReport; We do things differently for Trigger.io, we need a callback function!

      callback(weatherReport);
    };

    /* Our callback function to fire in case of an error */
    function getForecastOnError(error) {
      alert('Weather request error:\n' + error);
    };

    /* MET Office data point URL explained here: http://www.metoffice.gov.uk/datapoint/getting-started */
    var baseURL = 'http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/';
    var qry = loc_id + '?res=hourly';
    var key = '&key=3dd3210c-9aff-4547-9c28-9b590cc7d2c9';
    var forecast_req = baseURL + qry + key;

    /* Let's try and get our weather data! */
    var promise;

    function makeNativeForecastReq(method, url){
      return new Promise( function(resolve, reject){
        var forecast_xhr = new XMLHttpRequest();
        forecast_xhr.open(method, url);

        forecast_xhr.onload = function(){
          if(this.status >= 200 && this.status < 300){
            resolve(forecast_xhr.response);
          }
          else{
            reject({
              status: this.status,
              statusText: forecast_xhr.statusText
            });
          }
        };

        forecast_xhr.onerror = function(){
          reject({
            status: this.status,
            statusText: forecast_xhr.statusText
          });
        };

        forecast_xhr.send();
      });
    }

    /* Make our request */
    if(promiseType === 'forge'){

      var promise = forge.request.ajax({
        url: forecast_req,
        dataType: "json",
        success: function(forecast){
          window.weather_timestamps.retrievalTime = performance.now();
          var forecast = getForecastOnSuccess(forecast, callback);
          return forecast;
        },
        error: function(e){
          console.log(e);
          return getForecastOnError(e);
        }
      });
    }
    else{
      /* Get forecast - fallback to native if the promiseType parameter isn't defined */
      promise = makeNativeForecastReq(
        'GET', forecast_req
      ).then( 
        function forecastReqSuccessCallback(forecast){
          window.weather_timestamps.retrievalTime = performance.now();
          var forecast = getForecastOnSuccess( JSON.parse(forecast), callback ); // Convert the returned string back to an object
          return forecast;
      }).catch(
        function (e){
          console.log(e);
          throw 'There has been an error getting the forecast data.';
        }
      );
    }

    return promise;
  }

  function siteListOnError(response) {
    alert('Met Office \"sitelist.json\" request error\n (Invalid Response) Status:' + response.status + ' Status Text: ' + response.statusText);
  }

  /* First we get our weather station site list provided by the MET Office and then either throw an error or continue to get a weather report */
  // var req = 'http://localhost:3000/js/met-office/sitelist.json'; // LOCAL DEV

  /* We have to do things slightly differently to promisfy the native implementation */
  function makeNativeSitelistReq(method, url){
    return new Promise( function(resolve, reject){
      var sitelist_xhr = new XMLHttpRequest();
      sitelist_xhr.open(method, url);

      sitelist_xhr.onload = function(){
        if(this.status >= 200 && this.status < 300){
          resolve(sitelist_xhr.response);
        }
        else{
          reject({
            status: this.status,
            statusText: sitelist_xhr.statusText
          });
        }
      };

      sitelist_xhr.onerror = function(){
        reject({
          status: this.status,
          statusText: sitelist_xhr.statusText
        });
      };

      sitelist_xhr.send();
    });
  }

  var promise;

  /* 
   * Trigger.io cannot make AJAX requests to local files due to its URL canonicalisation being non-standard.
   * Instead we include the sitelist as a script in a variable accessible to everything and pass it through
   * return siteListOnSuccess(response, pos, callback);
  */

  return siteListOnSuccess(sitelist, pos, callback);

/*
  if(promiseType === 'forge'){
    Get Site List
    promise = forge.request.ajax({
      url: req,
      dataType: "json",
      success: function(response){
        return siteListOnSuccess(response, pos, callback);
      },
      error: function(error){
        return siteListOnError();
      }
    });
  }
  else{
    Get Site List - fallback to native if the promiseType parameter isn't defined
    promise = makeNativeSitelistReq(
      'GET', req
    ).then(
      function sitelistSuccessCallback(response){
        return siteListOnSuccess(response, pos, callback);
      }
    ).catch(
      function(e){
        console.log(e);
        throw 'There has been an error getting the "sitelist.json" file.';
    }).then(
      function(response){
        return response;
      }
    );
  }
*/

  // return promise;
};

var outputWeather = function(weatherReport){
  //console.log(weatherReport);

  document.getElementById("weather-report-date-result").innerHTML = weatherReport.dataDate;
  document.getElementById("weather-report-temp-result").innerHTML = weatherReport.temp;
  document.getElementById("weather-report-weather-type-result").innerHTML = weatherReport.weather_type;
  document.getElementById("weather-report-humidity-result").innerHTML = weatherReport.hum;
  document.getElementById("weather-report-wind-result").innerHTML = weatherReport.wind;

  /* Calculate our performance speed times */
  window.weather_timestamps.outputTime = performance.now();
  // console.log('Times:', window.weather_timestamps);

  var retrieval_time = window.weather_timestamps.retrievalTime - window.weather_timestamps.originTime;
  var processing_time = window.weather_timestamps.processingTime - window.weather_timestamps.retrievalTime;
  var output_time = window.weather_timestamps.outputTime - window.weather_timestamps.processingTime;
  var total_time = retrieval_time + processing_time + output_time;

  // console.log(retrieval_time);
  // console.log(processing_time);
  // console.log(output_time);

  document.getElementById("weather-report-retrieval-time-result").innerHTML = (retrieval_time.toPrecision(5)).toString() + 'ms';
  document.getElementById("weather-report-processing-time-result").innerHTML = (processing_time.toPrecision(5)).toString() + 'ms';
  document.getElementById("weather-report-output-time-result").innerHTML = (output_time.toPrecision(5)).toString() + 'ms';
  document.getElementById("weather-report-total-time-result").innerHTML = (total_time.toPrecision(5)).toString() + 'ms';

};

var getWeatherClick = function(type){

      /* This is the object for the time taken to retrieve the weather forecast and also the time taken to process and output it */
      window.weather_timestamps = {
          originTime: performance.now(),
          retrievalTime: 0,
          processingTime: 0,
          outputTime: 0
      };

      /* 
       * Using the startTimestamp from the performance() API as a baseline we can subtract other performance.now()
       * timestamps from it to get accurate timings of the retrieval, processing and output times
      */

      var pos = {
          coords: {
            latitude: 55.843353, // Co-ords for UWS, Paisley Campus
            longitude: -4.429053
          }
        }

      getWeather(pos, type, outputWeather);
};

/* API Docs Here: https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/#searchexamples */
var searchiTunesGetResults = function (req, promiseType, callback) {

  /* We have to do things slightly differently to promisfy the native implementation */
  function makeiTunesSearchReq(method, url){
    return new Promise( function(resolve, reject){
      var itunes_xhr = new XMLHttpRequest();
      itunes_xhr.open(method, url);

      itunes_xhr.onload = function(){
        if(this.status >= 200 && this.status < 300){
          resolve(itunes_xhr.response);
        }
        else{
          reject({
            status: this.status,
            statusText: itunes_xhr.statusText
          });
        }
      };

      itunes_xhr.onerror = function(){
        reject({
          status: this.status,
          statusText: itunes_xhr.statusText
        });
      };

      itunes_xhr.send();
    });
  }

  var promise = false;

  /* NOTE:
   * Our request is expected as: "https://itunes.apple.com/search?term=jack+johnson" if in production, 
   * OR "/search?term=jack+johnson" in development with our node server.js file running and NOT ionic for proxy support.
   * SO BE SURE TO PASS THAT WHEN CALLING THIS SERVICE!
   */
  var reqUrl = req;

  if(promiseType === 'forge'){
    /* Get Site List */
    return promise = forge.request.ajax({
      url: reqUrl,
      dataType: "json",
      success: function(response){
        // console.log(response);
        callback(response);
      },
      error: function(error){
        console.error('There has been an error returning results for your iTunes search query.', error);
      }
    });
  }
  else{
    /* iTunes Request - fallback to native if the promiseType parameter isn't defined */
    return promise = makeiTunesSearchReq(
      'GET', reqUrl
    ).then(
      function iTunesSearchSuccessCallback(response){
        // console.log(JSON.parse(response));
        callback(JSON.parse(response));
      }
    ).catch(
      function(e){
        throw 'There has been an error returning results for your iTunes search query.';
    });
  }

  /* If we've caught nothing return false */
  return promise;
}

var searchiTunesOutputResults = function(response){
    var total_time = (performance.now() - window.iTunes_search_start_time).toPrecision(5);
    // console.log('Response & Time:', response, total_time + 'ms');
    document.getElementById('itunes-search-query-time-result').innerHTML = total_time + 'ms';
};

var searchiTunesMediaClick = function(promiseType){
    var root = 'http://itunes.apple.com/';
    window.iTunes_search_start_time = performance.now();
    var limit = $('#itunes-search-query-details-list li input:checked').val();

    searchiTunesGetResults(root + 'search?term=the+beatles&country=gb&limit=' + limit, promiseType, searchiTunesOutputResults);
};

var mobileHideNav = function(){
    $('#mobile-nav-menu-button, #mobile-nav-menu').removeClass('active');
};

/* Mobile Navigation */
$(document).ready( function(){
  $('#mobile-nav-menu-button').click( function(event){
    event.preventDefault();

    $(this).addClass('active');
    $('#mobile-nav-menu').addClass('active');
  });

  $('#mobile-nav-menu-close').click( function(event){
    event.preventDefault();
    mobileHideNav();
  });

  $('#mobile-nav-menu-list li a').click( function(event){
    event.preventDefault();

    var id = parseInt($(this).attr('data-nav-id'));

    switch(id){
      case 0:
          $("#templates").load("../templates/cordova-trigger-performance-test.html #content", function(){
            var template = document.getElementById('content').innerHTML;
            var output = Mustache.render(template, view);
            $("#container").html(output);
          });
      break;

      case 1:
          var view = {
            totalTime: '0.00ms'
          };

          $("#templates").load("../templates/itunes-search-test.html #content", function(){
            var template = document.getElementById('content').innerHTML;
            var output = Mustache.render(template, view);
            $("#container").html(output);
          });   
      break;

      case 2:
          var view = {
            weather: {
              date: '',
              temp: '',
              weather_type: '',
              hum: '',
              wind: ''
            },
            latitude: '55.843353',
            longitude: '-4.429053',
            retrievalTime: '0.00ms',
            processingTime: '0.00ms',
            outputTime: '0.00ms',
            totalTime: '0.00ms'
          };

          $("#templates").load("../templates/q-vs-forgerequest-weather-test.html #content", function(){
            var template = document.getElementById('content').innerHTML;
            var output = Mustache.render(template, view);
            $("#container").html(output);
          });     
      break;

      case 3:
        $("#templates").load("../templates/videojs.html #content", function(){
          var template = document.getElementById('content').innerHTML;
          var output = Mustache.render(template, view);
          $("#container").html(output);

          /* Play video */
          videojs("video-stress-test-vid").ready( function(){
            var player = this;

            // Start our video
            player.play();
          });
        });
      break;
    }

    mobileHideNav();
  });
});