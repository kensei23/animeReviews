// apiHelper.js
import fetch from 'node-fetch';

async function fetchPopularAnime() {
  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
          Page(page: 1, perPage: 5) {
            media(sort: SCORE_DESC, type: ANIME) {
              id
              title {
                romaji
              }
              averageScore
              coverImage {
                large
              }
            }
          }
        }
      `,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch popular anime');
  }

  const popularAnimeData = await response.json();
  return popularAnimeData.data.Page.media;
}

export default fetchPopularAnime;
