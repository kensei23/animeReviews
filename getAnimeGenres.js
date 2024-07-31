import fetch from 'node-fetch';

export const fetchGenresFromAniList = async (animeName) => {
  const genreQuery = `
    query ($name: String) {
      Media(search: $name, type: ANIME) {
        genres
      }
    }
  `;

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: genreQuery,
      variables: { name: animeName }
    }),
  });

  const data = await response.json();
  return data.data.Media.genres;
};
