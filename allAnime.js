import fetch from 'node-fetch';

async function searchAnime(query) {
    const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query ($search: String) {
                    Page(page: 1, perPage: 10) {
                        media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
                            id
                            title {
                                romaji
                            }
                            coverImage {
                                large
                            }
                        }
                    }
                }
            `,
            variables: { search: query },
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to search anime');
    }

    const animeData = await response.json();
    return animeData.data.Page.media;
}

export { searchAnime };
