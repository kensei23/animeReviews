// apiHelper.js
import fetch from 'node-fetch';

async function fetchPopularAnime() {
  const query = `
    query {
      Page(page: 1, perPage: 5) {
        media(sort: POPULARITY_DESC, type: ANIME) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
        }
      }
    }
  `;

  const url = 'https://graphql.anilist.co';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data.data.Page.media;
  } catch (error) {
    console.error('Error fetching popular anime:', error);
    return [];
  }
}

export default fetchPopularAnime;
