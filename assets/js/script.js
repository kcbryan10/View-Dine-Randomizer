var movieOptionsContainerEl = document.getElementById("movie-options-list");
var dinnerOptionsContainerEl = document.getElementById("dinner-options-list");
var submitButtonEl = document.getElementById("submit");

// base URLs
var TMDB_KEY = "api_key=28589eaa3f119e982da41302aa616aef";

var TMDB_DISCOVER = "https://api.themoviedb.org/3/discover/movie?" + TMDB_KEY;

var TMDB_MOVIE = "https://api.themoviedb.org/3/movie/";

var EDAMAM_KEY = "app_key=9d8e41e1bea3b6670c9e1ca016fd4be4";

var EDAMAM_RANDOM =
  "https://api.edamam.com/api/recipes/v2?app_id=902dbf54&" +
  EDAMAM_KEY +
  "&type=public&random=true";

// fetch random selection of five movies
var getMoviesByYear = function (year) {
  // first call to get number of pages
  fetch(
    TMDB_DISCOVER +
      "&include_adult=false&region=US&primary_release_year=" +
      year
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var moviesArray = [];

      // if more than one page of results, randomize
      if (data.total_pages > 1) {
        // loop for second call to randomize page selection
        for (var i = 0; i < 5; i++) {
          var page = Math.floor(Math.random() * data.total_pages + 1);
          fetch(
            TMDB_DISCOVER +
              "&include_adult=false&region=US&primary_release_year=" +
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
      } else {
        var numOfResultsOrFive =
          data.total_results >= 5 ? 5 : data.total_results;
        for (var i = 0; i < numOfResultsOrFive; i++) {
          moviesArray.push(data.results[i]);
        }
        renderRandomMovies(moviesArray);
      }
    });
};

// render the movie options
var renderRandomMovies = function (moviesArray) {
  // clear previous search
  movieOptionsContainerEl.innerHTML = "";

  // create and append the buttons
  for (var i = 0; i < moviesArray.length; i++) {
    var movie = moviesArray[i];

    var movieListItemEl = document.createElement("li");
    movieListItemEl.setAttribute("class", "tab");

    var movieAnchorEl = document.createElement("a");
    movieAnchorEl.setAttribute("data-movieid", movie.id);
    movieAnchorEl.setAttribute("class", "waves-effect waves-light btn-small");
    movieAnchorEl.innerText = movie.title;

    movieListItemEl.appendChild(movieAnchorEl);

    // render to the DOM
    movieOptionsContainerEl.appendChild(movieListItemEl);
  }
};

// when a user clicks on a movie title button
var getSelectedMovieInfo = function (movieId) {
  fetch(TMDB_MOVIE + movieId + "?" + TMDB_KEY)
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
    })
    .then(function (data) {
      console.log(data);
      // store genres
      var genres = [];
      for (var i = 0; i < data.genres.length; i++) {
        genres.push(data.genres[i].name);
      }

      // store year
      var year = data.release_date.split("-")[0];

      // package needed info for rendering
      var movieInfo = {
        title: data.title,
        genre: genres,
        year: year,
        overview: data.overview,
        imgSrc: "https://image.tmdb.org/t/p/original" + data.poster_path,
      };

      displayMovieInfo(movieInfo);
    });
};

var displayMovieInfo = function (movieInfo) {
  var contentContainerEl = document.getElementById("movie-details-container");

  // clear previous content
  contentContainerEl.innerHTML = "";

  var movieTitleEl = document.createElement("h3");
  movieTitleEl.innerText = movieInfo.title;

  var movieYearEl = document.createElement("span");
  movieYearEl.innerText = movieInfo.year;

  var movieGenreEl = document.createElement("span");
  movieGenreEl.innerText = movieInfo.genre.map(function (genre) {
    return " " + genre;
  });

  var movieImageEl = document.createElement("img");
  movieImageEl.setAttribute("src", movieInfo.imgSrc);

  var movieOverviewEl = document.createElement("p");
  movieOverviewEl.innerText = movieInfo.overview;

  contentContainerEl.append(
    movieTitleEl,
    movieYearEl,
    movieGenreEl,
    movieImageEl,
    movieOverviewEl
  );
};

// fetch random recipe
var getRandomRecipe = function (food) {
  var foodsArray = [
    "pasta",
    "risotto",
    "salad",
    "bread",
    "curry",
    "vegetable",
    "soup",
    "antipasti",
    "roast",
    "bbq",
    "stew",
    "pizza",
    "sandwich",
    "wrap",
    "meatball",
  ];

  // if no input, randomly select query from foodsArray
  if (!food) {
    food = foodsArray[Math.floor(Math.random() * foodsArray.length)];
  }
  fetch(EDAMAM_RANDOM + "&q=" + food)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var numOfHits = data.hits.length;

      // if 5 or less hits in the response, loop through, otherwise loop 5 times
      if (numOfHits > 5) {
        numOfHits = 5;
      }

      // clear previous search
      dinnerOptionsContainerEl.innerHTML = "";

      // create buttons and append
      for (var i = 0; i < numOfHits; i++) {
        var recipe = data.hits[i].recipe;
        var recipesListItemEl = document.createElement("li");
        recipesListItemEl.setAttribute("class", "tab");

        var recipeButtonEl = document.createElement("a");
        recipeButtonEl.setAttribute(
          "class",
          "waves-effect waves-light btn-small"
        );
        var foodId = recipe.uri.split("#")[1];
        recipeButtonEl.setAttribute("data-foodid", foodId);

        recipeButtonEl.innerText = recipe.label;

        recipesListItemEl.appendChild(recipeButtonEl);
        dinnerOptionsContainerEl.append(recipesListItemEl);
      }
    });
};

var getSelectedFoodInfo = function (foodId) {
  fetch(
    "https://api.edamam.com/api/recipes/v2/" +
      foodId +
      "?type=public&app_id=902dbf54&" +
      EDAMAM_KEY
  )
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
    })
    .then(function (data) {
      // package needed data
      var foodInfo = {
        name: data.recipe.label,
        ingredientArray: data.recipe.ingredientLines,
        img: data.recipe.image,
        recipeUrl: data.recipe.url,
      };

      renderFoodInfo(foodInfo);
    });
};

var renderFoodInfo = function (foodInfo) {
  var contentContainerEl = document.getElementById("food-details-container");

  // clear previous selection
  contentContainerEl.innerHTML = "";

  var foodNameEl = document.createElement("h3");
  foodNameEl.innerText = foodInfo.name;

  var foodImageEl = document.createElement("img");
  foodImageEl.setAttribute("src", foodInfo.img);

  var foodIngredientsListEl = document.createElement("ul");

  // loop through ingredients and add them as list items to the <ul>
  for (var i = 0; i < foodInfo.ingredientArray.length; i++) {
    var foodIngredientItemEl = document.createElement("li");
    foodIngredientItemEl.innerText = foodInfo.ingredientArray[i];
    foodIngredientsListEl.appendChild(foodIngredientItemEl);
  }

  // add link for recipe
  var foodRecipeEl = document.createElement("span");
  var recipeLink = foodInfo.recipeUrl.split("/")[2];
  foodRecipeEl.innerHTML =
    "Recipe instructions: <a target='_blank' href=" +
    foodInfo.recipeUrl +
    ">" +
    recipeLink +
    "</a>";

  contentContainerEl.append(
    foodNameEl,
    foodImageEl,
    foodIngredientsListEl,
    foodRecipeEl
  );
};

var foodSelectedHandler = function (event) {
  // check if it is a valid click
  if (!event.target.dataset.foodid) {
    return;
  }
  getSelectedFoodInfo(event.target.dataset.foodid);
};

dinnerOptionsContainerEl.addEventListener("click", foodSelectedHandler);
//getRandomRecipe();

var movieSelectedHandler = function (event) {
  // check if it is a valid click
  if (!event.target.dataset.movieid) {
    return;
  }
  getSelectedMovieInfo(event.target.dataset.movieid);
};

var handleSubmit = function () {
  getMoviesByYear();
  getRandomRecipe();
};

$(document).ready(function () {
  //display selected pair
  $(movieOptionsContainerEl).on("click", "a", function () {
    var movieTitle = $(this).text();
    var createPairMovie = document.createElement("a");
    createPairMovie.setAttribute(
      "class",
      "waves-effect waves-light btn-small movieS"
    );

    var MoviePair = document.getElementById("movie-pair-title");

    MoviePair.appendChild(createPairMovie);
    createPairMovie.append(movieTitle);
  });

  $(dinnerOptionsContainerEl).on("click", "a", function () {
    var foodTitle = $(this).text();

    var createPairFood = document.createElement("a");

    createPairFood.setAttribute("class",
      "waves-effect waves-light btn-small foodS" 
    );

    var foodPair = document.getElementById("food-pair-title");

    foodPair.appendChild(createPairFood);

    createPairFood.append(foodTitle);
  });

  //remove unwanted elements from selected pair
  $("#pair").on("click", "a", function(){
      var element= $(this)
      element.remove();
  })


  //save selected option

  var MoviePair = document.getElementById("1");
  var FoodPair = document.getElementById("2");

  $("#save-Btn").on("click", function () {
    var createPairBox = document.createElement("div");
    $(".movieS").appendTo("#1");
    $(".foodS").appendTo("#2");
    localStorage.setItem("Movie", MoviePair.outerHTML);
    localStorage.setItem("Food", FoodPair.outerHTML);
  });

  //retrieve pairs
  function getPair() {
    var setMovie = localStorage.getItem("Movie");
    $(setMovie).appendTo(MoviePair);
    var setFood = localStorage.getItem("Food");
    $(setFood).appendTo(FoodPair);
  }

  getPair();
});

submitButtonEl.addEventListener("click", handleSubmit);
movieOptionsContainerEl.addEventListener("click", movieSelectedHandler);
