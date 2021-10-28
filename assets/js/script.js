// important DOM elements
var movieContainerEl = document.getElementById("movie-container");

// fetch random selection of five movies
var getMoviesByYear = function (year) {
  // first call to get number of pages
  fetch(
    "https://api.themoviedb.org/3/discover/movie?api_key=28589eaa3f119e982da41302aa616aef&include_adult=false&region=US&year=" +
      year
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // loop for second call to randomize page selection
      var moviesArray = [];
      for (var i = 0; i < 5; i++) {
        var page = Math.floor(Math.random() * data.total_pages + 1);
        fetch(
          "https://api.themoviedb.org/3/discover/movie?api_key=28589eaa3f119e982da41302aa616aef&include_adult=false&region=US&year=" +
            year +
            "&page=" +
            page
        )
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            // use a random index to pull a single movie
            var randomIndex = Math.floor(Math.random() * data.results.length);
            // push movie into array
            moviesArray.push(data.results[randomIndex]);
          })
          .then(function () {
            if (moviesArray.length === 5) {
              renderRandomMovies(moviesArray);
            }
          });
      }
    });
};

// render the movie options
var renderRandomMovies = function (moviesArray) {
  // container for the buttons
  var movieButtonContainerEl = document.createElement("div");
  movieButtonContainerEl.setAttribute("id", "movie-button-container");

  // create and append the buttons
  for (var i = 0; i < moviesArray.length; i++) {
    var movie = moviesArray[i];
    var movieButtonEl = document.createElement("button");
    movieButtonEl.setAttribute("data-title", movie.title);
    movieButtonEl.innerText = movie.title;

    movieButtonContainerEl.appendChild(movieButtonEl);
  }

  // render to the DOM
  movieContainerEl.appendChild(movieButtonContainerEl);
};
getMoviesByYear(2000);
