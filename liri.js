require("dotenv").config();
var axios = require("axios");
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var moment = require("moment");
var fs = require("fs");

var textToLog = "";
var userInput = [];
for (var i = 2; i < process.argv.length; i++) {
  userInput.push(process.argv[i]);
}

function spotifyCall() {
  var spotify = new Spotify(keys.spotify);
  var search = userInput.slice(1).join(" ");

  spotify.search({ type: "track", query: search }, function(err, data) {
    if (err) {
      updateLog("Error: " + err);
      updateText();
    } else {
      var song = data.tracks.items[0];

      updateLog('Spotify search results for "' + search + '":');
      updateLog("------------------------------------------");
      updateLog("  Artist: " + song.artists[0].name);
      updateLog("    Song: " + song.name);
      updateLog(" Preview: " + song.external_urls.spotify);
      updateLog("   Album: " + song.album.name);
      updateLog("------------------------------------------\n");
      updateText();
    }
  });
}

function omdbCall() {
  var apiKey = "9795fd19";
  var search = userInput.slice(1).join(" ");
  var queryURL =
    "http://www.omdbapi.com/?t=" + search + "&y=&plot=short&apikey=" + apiKey;

  axios.get(queryURL).then(function(response) {
    var movie = response.data;

    updateLog('IMDb search results for "' + search + '":');
    updateLog("------------------------------------------");
    updateLog("                 Title: " + movie.Title);
    updateLog("                  Year: " + movie.Year);
    updateLog("           IMDb Rating: " + movie.Ratings[0].Value);
    updateLog("Rotten Tomatoes Rating: " + movie.Ratings[1].Value);
    updateLog("               Country: " + movie.Country);
    updateLog("              Language: " + movie.Language);
    updateLog("                  Plot: " + movie.Plot);
    updateLog("                 Stars: " + movie.Actors);
    updateLog("------------------------------------------\n");
    updateText();
  });
}

function bandsInTownCall() {
  var search = userInput.slice(1).join(" ");
  var queryURL =
    "https://rest.bandsintown.com/artists/" +
    search +
    "/events?app_id=codingbootcamp";

  axios.get(queryURL).then(function(response) {
    var band = response.data;
    updateLog('Concert search results for "' + search + '":');
    updateLog("------------------------------------------");

    for (var i = 0; i < band.length; i++) {
      updateLog("   Venue: " + band[i].venue.name);
      updateLog(
        "Location: " + band[i].venue.city + ", " + band[i].venue.region
      );
      var date = moment(band[i].datetime).format("MM/DD/YYYY");
      updateLog("    Date: " + date);
      updateLog("------------------------------------------\n");
    }
    updateText();
  });
}

function displayHelp() {
  updateLog(
    'Recognized commands:\n"spotify-this-song" to search for a song based on the title\nEx: spotify-this-song all the small things\n"movie-this" to search for a movie based on the movie title\nEx: movie-this the lion king\n"concert-this" to search for upcoming concerts for a given artist\nEx: concert-this lady gaga'
  );
  updateText();
}

function doWhatItSays() {
  fs.readFile("random.txt", "utf8", function(err, data) {
    if (err) {
      updateLog("Error code: " + err);
      updateText();
    }
    userInput = [];
    userInput = data.split(",");
    findCall(userInput[0]);
  });
}

function updateLog(text) {
  console.log(text);
  textToLog += "\n" + text;
}

function updateText() {
  fs.appendFile("log.txt", "\n" + textToLog, function(err) {
    if (err) {
      return console.log(err);
    } else {
      textToLog = "";
    }
  });
}

function findCall(command) {
  if (userInput.length > 1) {
    switch (command) {
      case "spotify-this-song":
        spotifyCall();
        break;
      case "movie-this":
        omdbCall();
        break;
      case "concert-this":
        bandsInTownCall();
        break;
      default:
        updateLog(
          command +
            ": Not a valid command. Type 'help' to see recognized commands."
        );
        updateText();
        break;
    }
  } else {
    switch (command) {
      case "help":
        displayHelp();
        break;
      case undefined:
        displayHelp();
        break;
      case "do-what-it-says":
        doWhatItSays();
        break;
      default:
        updateLog(
          "Please enter valid search criteria. Use the 'help' command to see examples."
        );
        updateText();
    }
  }
}

findCall(userInput[0]);
