const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let database = null;

const initializingDBandServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () =>
      console.log("Server Running at http://localhost:3003/")
    );
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};
initializingDBandServer();

const convertMovieObjectToResponseObject = (movie) => {
  return {
    movieId: movie.movie_id,
    movieName: movie.movie_name,
    directorId: movie.director_id,
    leadActor: movie.leadActor,
  };
};

const convertDirObjectToResponseObject = (director) => {
  return {
    directorId: director.director_id,
    directorName: director.director_name,
  };
};

//ALL Movies
app.get("/movies/", async (request, response) => {
  const getMovies = `
  SELECT
   *
  FROM 
   movie;`;
  const moviesArr = await database.all(getMovies);
  response.send(
    moviesArr.map((eachMovie) => convertMovieObjectToResponseObject(eachMovie))
  );
});

//CREATE MovieDetails
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovie = `
  INSERT INTO
  movies(director_id,movie_name,lead_actor) 
  VALUES(
  '${directorId}',
  '${movieName}',
  '${leadActor}'
  );`;
  const movie = await database.run(createMovie);
  response.send("Movie Successfully Added");
});

//GET Single Movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetails = `
    SELECT *
     FROM movie
    WHERE
    movie_id=${movieId};`;

  const movie = await database.get(getMovieDetails);
  response.send(convertMovieObjectToResponseObject(movie));
});

//UPDATE Movie

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovie = `
    UPDATE
     movie
    SET
    director_id=${directorId},
    movie_name=${movieName},
    lead_actor=${leadActor},
    WHERE
    movie_id=${movie_id};`;

  await database.run(updateMovie);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM
    movie
    WHERE
    movie_id=${movieId};`;

  await database.run(deleteMovie);
  response.send("Movie Removed");
});

//GET ALL DIRECTORS
app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT *
    FROM director;`;

  const directorArr = await database.all(getDirectors);
  response.send(
    directorArr.map((eachDirector) =>
      convertDirObjectToResponseObject(directorArr)
    )
  );
});

//GET DIRECTOR NAMES

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorDetails = `
    SELECT
    movie_name
     FROM
    movie
    WHERE
    director_id=${directorId};`;

  const moviesArr = await database.all(getDirectorDetails);
  console.log(moviesArr);
  response.send(
    moviesArr.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
