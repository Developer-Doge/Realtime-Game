import axios from "axios";

const API_BASE_URL = "https://jservice.io/api";

export async function getRandomCategories(numCategories = 6, gameId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      params: {
        count: numCategories,
        offset: Math.trunc(gameId / 100),
      },
    });
    const categories = response.data;
    return categories;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getCategoryClues(categoryId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/clues`, {
      params: {
        category: categoryId,
      },
    });
    const clues = response.data;
    return clues;
  } catch (error) {
    console.error(error);
    return null;
  }
}
