// important DOM elements
var movieContainerEl = document.getElementById("movie-options-list");
var dinnerOptionsContainerEl = document.getElementById("dinner-options-list");

// base URLs
var TMDB_DISCOVER =
  "https://api.themoviedb.org/3/discover/movie?api_key=28589eaa3f119e982da41302aa616aef";

var EDAMAM_KEY = "app_key=9d8e41e1bea3b6670c9e1ca016fd4be4";

var EDAMAM_RANDOM =
  "https://api.edamam.com/api/recipes/v2?app_id=902dbf54&" +
  EDAMAM_KEY +
  "&type=public&random=true";

// fetch random selection of five movies
var getMoviesByYear = function (year) {
  // TODO: user input verification

  // first call to get number of pages
  fetch(TMDB_DISCOVER + "&include_adult=false&region=US&year=" + year)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // loop for second call to randomize page selection
      var moviesArray = [];
      for (var i = 0; i < 5; i++) {
        var page = Math.floor(Math.random() * data.total_pages + 1);
        fetch(
          TMDB_DISCOVER +
            "&include_adult=false&region=US&year=" +
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

  // create and append the buttons
  for (var i = 0; i < moviesArray.length; i++) {
    var movie = moviesArray[i];

    var movieListItemEl = document.createElement("li");
    movieListItemEl.setAttribute("id", "movie-button-item");
    movieListItemEl.setAttribute("class", "tab");

    var movieAnchorEl = document.createElement("a");
    movieAnchorEl.setAttribute("data-title", movie.title);
    movieAnchorEl.setAttribute("class", "waves-effect waves-light btn-small");
    movieAnchorEl.innerText = movie.title;

    movieListItemEl.appendChild(movieAnchorEl);

    // render to the DOM
    movieContainerEl.appendChild(movieListItemEl);
  }
};
// TODO: attach to event listener
getMoviesByYear(2000);

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
      var recipeButtonContainerEl = document.createElement("div");

      // if 5 or less hits in the response, loop through, otherwise loop 5 times
      if (numOfHits > 5) {
        numOfHits = 5;
      }

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
// TODO: attach to event listener
getRandomRecipe();

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
  for (var i = 0; i < foodInfo.ingredientArray.length; i++) {
    var foodIngredientItemEl = document.createElement("li");
    foodIngredientItemEl.innerText = foodInfo.ingredientArray[i];
    foodIngredientsListEl.appendChild(foodIngredientItemEl);
  }

  var foodRecipeEl = document.createElement("span");
  var recipeLink = foodInfo.recipeUrl.split("/")[2];
  console.log(recipeLink);
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
