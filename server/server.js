const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

const OMDB_API_KEY = "4bcb81a5"; // todo

app.get("/api/movies/popular", async (req, res) => {
  try {
    const response = await axios.get(
      `http://www.omdbapi.com/?apiKey=${OMDB_API_KEY}&s=movies&type=movie&y=2024&page=1`
    );
    res.json(response.data.Search);
  } catch (error) {
    res.status(500).json({ message: "Error fetching popular movies" });
  }
});

app.get("/api/movies/search", async (req, res) => {
  const { query, language, genre } = req.query;
  console.log(query, language, genre);
  try {
    if (!query) {
      console.log("Search query is missing");
      return res.status(400).json({ message: "Search query is required" });
    }
    const url = `http://www.omdbapi.com`;
    const params = { apiKey: OMDB_API_KEY, s: query, type: "movie" };
    console.log("Making req to OMDB API", url, params);
    const response = await axios.get(url, { params });
    console.log("OMDB API response:", response.data);
    if (response.data.Error) {
      return res.status(404).json({ message: response.data.Error });
    }
    res.json(response.data);
  } catch (error) {
    console.error("Error details:", error);
    if (error.response && error.response.status === 401) {
      console.error(
        "Unauthorized error: this is likely due to invalid api key"
      );
      return res
        .status(500)
        .json({ message: "Error searching movies", error: "Invalid API Key" });
    }
    console.error("Error searching movies:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error searching movies",
      error: error.message,
    });
  }
});

app.get("/api/movies/recommendations", async (req, res) => {
  const { titles } = req.query;
  try {
    if (!titles) {
      return res.status(400).json({ message: "No search titles provided" });
    }

    const titleArray = titles.split(",");
    const recommendationsPromises = titleArray.map((title) =>
      axios.get(`http://www.omdbapi.com/`, {
        params: {
          apikey: OMDB_API_KEY,
          s: title.trim(),
          type: "movie",
        },
      })
    );

    const responses = await Promise.all(recommendationsPromises);
    const allRecommendations = responses.flatMap((response) =>
      response.data.Search ? response.data.Search : []
    );

    // Remove duplicates
    const uniqueRecommendations = Array.from(
      new Set(allRecommendations.map((movie) => movie.imdbID))
    ).map((id) => allRecommendations.find((movie) => movie.imdbID === id));

    res.json(uniqueRecommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
