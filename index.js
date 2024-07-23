// import express from 'express';
// import bodyParser from 'body-parser';
// import pg from 'pg';
// import session from 'express-session';
// import bcrypt from 'bcrypt';
// import path from 'path';
// import env from 'dotenv';
// import { fileURLToPath } from 'url';

// const { Pool } = pg;
// const app = express();
// const PORT = process.env.PORT || 3000;

// env.config();

// // Connect to PostgreSQL
// const pool = new Pool({
//   user: process.env.PG_USERNAME,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DB,
//   password: process.env.PG_PASSWORD,
//   port: process.env.PG_PORT,
// });

// // Get __dirname equivalent in ES module scope
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.set('view engine', 'ejs');
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.urlencoded({ extended: false }));

// app.use(session({
//   secret: 'your_secret_key',
//   resave: false,
//   saveUninitialized: false
// }));

// // Middleware to check if user is logged in
// function checkAuth(req, res, next) {
//   if (req.session.userId) {
//     next();
//   } else {
//     res.redirect('/login');
//   }
// }

// // Home page route
// app.get('/', (req, res) => {
//   pool.query('SELECT * FROM anime_entries', (err, result) => {
//     if (err) {
//       console.error('Error executing query', err.stack);
//       res.send('Error');
//     } else {
//       res.render('index', { entries: result.rows, userId: req.session.userId });
//     }
//   });
// });

// // Registration page
// app.get('/register', (req, res) => {
//   res.render('register', { message: null });
// });

// // Handle user registration
// app.post('/register', async (req, res) => {
//   const { username, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   try {
//     const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [username, hashedPassword]);
//     req.session.userId = result.rows[0].id;
//     res.redirect('/');
//   } catch (error) {
//     if (error.code === '23505') { // Unique violation error code in PostgreSQL
//       res.render('register', { message: 'Username is already in use' });
//     } else {
//       console.error(error);
//       res.render('register', { message: 'An error occurred, please try again' });
//     }
//   }
// });

// // Login page
// app.get('/login', (req, res) => {
//   res.render('login', { message: null });
// });

// // Handle user login
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const result = await pool.query('SELECT id, password FROM users WHERE username = $1', [username]);
//     if (result.rows.length > 0) {
//       const user = result.rows[0];
//       const match = await bcrypt.compare(password, user.password);
//       if (match) {
//         req.session.userId = user.id;
//         res.redirect('/');
//       } else {
//         res.render('login', { message: 'Invalid username or password' });
//       }
//     } else {
//       res.render('login', { message: 'Invalid username or password' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.render('login', { message: 'An error occurred, please try again' });
//   }
// });

// // Handle user logout
// app.get('/logout', (req, res) => {
//   req.session.destroy();
//   res.redirect('/');
// });

// // Add entry form route
// app.get('/add', checkAuth, (req, res) => {
//   res.render('add');
// });

// // Add entry form submission route
// app.post('/add', checkAuth, (req, res) => {
//   const { name, progress, rating, summary, image_url } = req.body;
//   const query = 'INSERT INTO anime_entries (name, progress, rating, summary, image_url, user_id) VALUES ($1, $2, $3, $4, $5, $6)';
//   const values = [name, progress, rating, summary, image_url, req.session.userId];
//   pool.query(query, values, (err) => {
//     if (err) {
//       console.error('Error executing query', err.stack);
//       res.send('Error');
//     } else {
//       res.redirect('/');
//     }
//   });
// });

// // Edit entry page
// app.get('/edit/:id', checkAuth, (req, res) => {
//   const entryId = req.params.id;
//   pool.query('SELECT * FROM anime_entries WHERE id = $1 AND user_id = $2', [entryId, req.session.userId], (err, result) => {
//     if (err) {
//       console.error('Error executing query', err.stack);
//       res.send('Error');
//     } else {
//       res.render('edit', { entry: result.rows[0] });
//     }
//   });
// });

// // Edit entry form submission route
// app.post('/edit/:id', checkAuth, (req, res) => {
//   const entryId = req.params.id;
//   const { name, progress, rating, summary, image_url } = req.body;
//   const query = 'UPDATE anime_entries SET name = $1, progress = $2, rating = $3, summary = $4, image_url = $5 WHERE id = $6 AND user_id = $7';
//   const values = [name, progress, rating, summary, image_url, entryId, req.session.userId];
//   pool.query(query, values, (err) => {
//     if (err) {
//       console.error('Error executing query', err.stack);
//       res.send('Error');
//     } else {
//       res.redirect('/');
//     }
//   });
// });

// // Delete entry route
// app.post('/delete/:id', checkAuth, (req, res) => {
//   const entryId = req.params.id;
//   pool.query('DELETE FROM anime_entries WHERE id = $1 AND user_id = $2', [entryId, req.session.userId], (err) => {
//     if (err) {
//       console.error('Error executing query', err.stack);
//       res.send('Error');
//     } else {
//       res.redirect('/');
//     }
//   });
// });

// // Search route
// app.get('/search', (req, res) => {
//   const searchTerm = req.query.term;
//   const query = 'SELECT * FROM anime_entries WHERE name ILIKE $1';
//   const values = [`%${searchTerm}%`];
//   pool.query(query, values, (err, result) => {
//     if (err) {
//       console.error('Error executing query', err.stack);
//       res.send('Error');
//     } else {
//       res.render('index', { entries: result.rows, userId: req.session.userId });
//     }
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import session from 'express-session';
import bcrypt from 'bcrypt';
import path from 'path';
import env from 'dotenv';
import { fileURLToPath } from 'url';
import fetchPopularAnime from './apiHelper.js'
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';


const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3000;

env.config();

// Connect to PostgreSQL
const pool = new Pool({
  user: process.env.PG_USERNAME,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Get __dirname equivalent in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// Middleware to check if user is logged in
function checkAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.session.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

/// Home page route
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM anime_entries ORDER BY id DESC LIMIT 20');
    const popularAnime = await fetchPopularAnime();
    
    let userProfilePicture = null;
    if (req.session.userId) {
      const query = 'SELECT profile_picture FROM users WHERE id = $1';
      const values = [req.session.userId];
      const userResult = await pool.query(query, values);
      
      if (userResult.rows.length > 0) {
        userProfilePicture = userResult.rows[0].profile_picture;
      }
    }

    res.render('index', {
      entries: result.rows,
      userId: req.session.userId,
      popularAnime,
      userProfilePicture
    });
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.send('Error');
  }
});

// Registration page
app.get('/register', (req, res) => {
  res.render('register', { message: null });
});

// Handle user registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [username, hashedPassword]);
    req.session.userId = result.rows[0].id;
    res.redirect('/');
  } catch (error) {
    if (error.code === '23505') { // Unique violation error code in PostgreSQL
      res.render('register', { message: 'Username is already in use' });
    } else {
      console.error(error);
      res.render('register', { message: 'An error occurred, please try again' });
    }
  }
});

// Login page
app.get('/login', (req, res) => {
  res.render('login', { message: null });
});

// Handle user login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT id, password FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.userId = user.id;
        res.redirect('/');
      } else {
        res.render('login', { message: 'Invalid username or password' });
      }
    } else {
      res.render('login', { message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.render('login', { message: 'An error occurred, please try again' });
  }
});

// Handle user logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Handle API query
app.get('/api/popular-anime', async (req, res) => {
  try {
    const query = `
      query {
        Page(perPage: 50) {
          media(sort: POPULARITY_DESC, type: ANIME) {
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
    `;
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    const { data } = await response.json();
    res.json(data.Page.media);
  } catch (error) {
    console.error('Error fetching popular anime:', error);
    res.status(500).send('Error fetching popular anime');
  }
});

// Profile page route
app.get('/profile', checkAuth, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    const entriesResult = await pool.query('SELECT * FROM anime_entries WHERE user_id = $1', [req.session.userId]);
    
    let userProfilePicture = null;
    if (userResult.rows.length > 0) {
      userProfilePicture = userResult.rows[0].profile_picture;
    }

    res.render('profile', { 
      user: userResult.rows[0], 
      userEntries: entriesResult.rows, 
      userId: req.session.userId, 
      userProfilePicture 
    });
  } catch (error) {
    console.error('Error fetching profile data', error.stack);
    res.send('Error');
  }
});

// Update account details route
app.post('/profile/update', checkAuth, async (req, res) => {
  const { name, email, favourite_anime } = req.body;
  try {
    await pool.query('UPDATE users SET name = $1, email = $2, favourite_anime = $3 WHERE id = $4', [name, email, favourite_anime, req.session.userId]);
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating profile', error.stack);
    res.send('Error');
  }
});

//PFP upload
app.post('/upload-pfp', checkAuth, upload.single('profile_picture'), async (req, res) => {
  try {
    const userId = req.session.userId;
    const profilePicturePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (profilePicturePath) {
      const filePath = req.file.path;
      const outputFilePath = `uploads/${userId}-profile.png`;

      const roundedCorners = Buffer.from(
        `<svg>
           <circle cx="100" cy="100" r="100"/>
         </svg>`
      );

      await sharp(filePath)
        .resize(200, 200, {
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy
        }) // Ensure the image is a square
        .composite([{ 
          input: roundedCorners,
          blend: 'dest-in'
        }])
        .png() // Output as PNG to support transparency
        .toFile(outputFilePath);

      // Delete the original uploaded file to save space
      fs.unlinkSync(filePath);

      // Update the database with the new profile picture path
      const query = 'UPDATE users SET profile_picture = $1 WHERE id = $2';
      const values = [outputFilePath, userId];
      await pool.query(query, values);

      res.redirect('/profile');
    } else {
      res.redirect('/profile');
    }
  } catch (err) {
    console.error('Error updating profile picture', err.stack);
    res.send('Error');
  }
});

// Add to Watchlist
app.post('/watchlist/add/:id', checkAuth, async (req, res) => {
  const animeId = req.params.id;
  const userId = req.session.userId;
  let userProfilePicture = null;
    if (req.session.userId) {
      const query = 'SELECT profile_picture FROM users WHERE id = $1';
      const values = [req.session.userId];
      const userResult = await pool.query(query, values);
      
      if (userResult.rows.length > 0) {
        userProfilePicture = userResult.rows[0].profile_picture;
      }
    }
  try {
      // Check if the anime is already in the watchlist
      const checkQuery = 'SELECT * FROM watchlist WHERE user_id = $1 AND anime_id = $2';
      const checkResult = await pool.query(checkQuery, [userId, animeId]);
      if (checkResult.rows.length > 0) {
          return res.send('Anime already in watchlist');
      }
      const query = 'INSERT INTO watchlist (user_id, anime_id) VALUES ($1, $2)';
      await pool.query(query, [userId, animeId]);
      res.redirect('/watchlist');
  } catch (err) {
      console.error('Error adding to watchlist', err.stack);
      res.send('Error');
  }
});

// Get Watchlist
app.get('/watchlist', checkAuth, async (req, res) => {
  let userProfilePicture = null;
    if (req.session.userId) {
      const query = 'SELECT profile_picture FROM users WHERE id = $1';
      const values = [req.session.userId];
      const userResult = await pool.query(query, values);
      
      if (userResult.rows.length > 0) {
        userProfilePicture = userResult.rows[0].profile_picture;
      }
    }
  try {
      const query = `
          SELECT anime_entries.* FROM watchlist
          JOIN anime_entries ON watchlist.anime_id = anime_entries.id
          WHERE watchlist.user_id = $1
      `;
      const result = await pool.query(query, [req.session.userId]);
      res.render('watchlist', { watchlist: result.rows, userId: req.session.userId, userProfilePicture });
  } catch (err) {
      console.error('Error fetching watchlist', err.stack);
      res.send('Error');
  }
});

// Get Entries for anime in watchlist
app.get('/anime/:name', async (req, res) => {
    const animeName = req.params.name;
    let userProfilePicture = null;
    if (req.session.userId) {
      const query = 'SELECT profile_picture FROM users WHERE id = $1';
      const values = [req.session.userId];
      const userResult = await pool.query(query, values);
      
      if (userResult.rows.length > 0) {
        userProfilePicture = userResult.rows[0].profile_picture;
      }
    }
    try {
        const query = 'SELECT * FROM anime_entries WHERE name = $1';
        const result = await pool.query(query, [animeName]);
        res.render('animeEntries', { entries: result.rows, animeName: animeName, userId: req.session.userId, userProfilePicture });
    } catch (err) {
        console.error('Error fetching anime entries', err.stack);
        res.send('Error');
    }
});

// Add entry form route
app.get('/add', checkAuth, (req, res) => {
  res.render('add');
});

// Add entry form submission route
app.post('/add', checkAuth, (req, res) => {
  const { name, progress, rating, summary, image_url, spoiler } = req.body;
  const isSpoiler = spoiler === 'on'; // Convert checkbox value to boolean
  const query = 'INSERT INTO anime_entries (name, progress, rating, summary, image_url, spoiler, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)';
  const values = [name, progress, rating, summary, image_url, isSpoiler, req.session.userId];
  pool.query(query, values, (err) => {
      if (err) {
          console.error('Error executing query', err.stack);
          res.send('Error');
      } else {
          res.redirect('/');
      }
  });
});

// Edit entry page
app.get('/edit/:id', checkAuth, async (req, res) => {
  const entryId = req.params.id;
  try {
      const result = await pool.query('SELECT * FROM anime_entries WHERE id = $1 AND user_id = $2', [entryId, req.session.userId]);
      const entry = result.rows[0];

      if (!entry) {
          return res.send('Entry not found or you do not have permission to edit it');
      }

      res.render('edit', { entry, userId: req.session.userId });
  } catch (err) {
      console.error('Error executing query', err.stack);
      res.send('Error');
  }
});

// Edit entry form submission route
app.post('/edit/:id', checkAuth, (req, res) => {
  const entryId = req.params.id;
  const { progress, rating, summary, spoiler } = req.body;
  const isSpoiler = spoiler === 'on'; // Convert checkbox value to boolean
  const query = 'UPDATE anime_entries SET progress = $1, rating = $2, summary = $3, spoiler = $4 WHERE id = $5 AND user_id = $6';
  const values = [progress, rating, summary, isSpoiler, entryId, req.session.userId];
  pool.query(query, values, (err) => {
      if (err) {
          console.error('Error executing query', err.stack);
          res.send('Error');
      } else {
          res.redirect('/');
      }
  });
});


// Delete entry route
app.post('/delete/:id', checkAuth, (req, res) => {
  const entryId = req.params.id;
  pool.query('DELETE FROM anime_entries WHERE id = $1 AND user_id = $2', [entryId, req.session.userId], (err) => {
    if (err) {
      console.error('Error executing query', err.stack);
      res.send('Error');
    } else {
      res.redirect('/');
    }
  });
});

// Like an entry
app.post('/like/:id', checkAuth, async (req, res) => {
  const entryId = req.params.id;
  try {
    // Check if user has already liked or disliked this entry
    const existingActionQuery = 'SELECT action FROM likes WHERE entry_id = $1 AND user_id = $2';
    const existingActionValues = [entryId, req.session.userId];
    const existingActionResult = await pool.query(existingActionQuery, existingActionValues);

    if (existingActionResult.rows.length === 0) {
      // User hasn't liked or disliked this entry yet, proceed with like
      await pool.query('UPDATE anime_entries SET likes = likes + 1 WHERE id = $1', [entryId]);
      // Record the user's like action
      const insertQuery = 'INSERT INTO likes (entry_id, user_id, action) VALUES ($1, $2, $3)';
      const insertValues = [entryId, req.session.userId, 'like'];
      await pool.query(insertQuery, insertValues);
    } else {
      const currentAction = existingActionResult.rows[0].action;
      if (currentAction === 'dislike') {
        // Toggle from dislike to like
        await pool.query('UPDATE anime_entries SET dislikes = dislikes - 1, likes = likes + 1 WHERE id = $1', [entryId]);
        await pool.query('UPDATE likes SET action = $1 WHERE entry_id = $2 AND user_id = $3', ['like', entryId, req.session.userId]);
      } else if (currentAction === 'like') {
        // Remove previous like
        await pool.query('UPDATE anime_entries SET likes = likes - 1 WHERE id = $1', [entryId]);
        await pool.query('DELETE FROM likes WHERE entry_id = $1 AND user_id = $2', [entryId, req.session.userId]);
      }
    }
    res.redirect('/');
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.send('Error');
  }
});

// Dislike an entry
app.post('/dislike/:id', checkAuth, async (req, res) => {
  const entryId = req.params.id;
  try {
    // Check if user has already liked or disliked this entry
    const existingActionQuery = 'SELECT action FROM likes WHERE entry_id = $1 AND user_id = $2';
    const existingActionValues = [entryId, req.session.userId];
    const existingActionResult = await pool.query(existingActionQuery, existingActionValues);

    if (existingActionResult.rows.length === 0) {
      // User hasn't liked or disliked this entry yet, proceed with dislike
      await pool.query('UPDATE anime_entries SET dislikes = dislikes + 1 WHERE id = $1', [entryId]);
      // Record the user's dislike action
      const insertQuery = 'INSERT INTO likes (entry_id, user_id, action) VALUES ($1, $2, $3)';
      const insertValues = [entryId, req.session.userId, 'dislike'];
      await pool.query(insertQuery, insertValues);
    } else {
      const currentAction = existingActionResult.rows[0].action;
      if (currentAction === 'like') {
        // Toggle from like to dislike
        await pool.query('UPDATE anime_entries SET likes = likes - 1, dislikes = dislikes + 1 WHERE id = $1', [entryId]);
        await pool.query('UPDATE likes SET action = $1 WHERE entry_id = $2 AND user_id = $3', ['dislike', entryId, req.session.userId]);
      } else if (currentAction === 'dislike') {
        // Remove previous dislike
        await pool.query('UPDATE anime_entries SET dislikes = dislikes - 1 WHERE id = $1', [entryId]);
        await pool.query('DELETE FROM likes WHERE entry_id = $1 AND user_id = $2', [entryId, req.session.userId]);
      }
    }
    res.redirect('/');
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.send('Error');
  }
});


// Search route
app.get('/search', async (req, res) => {
  const searchTerm = req.query.term;
  const query = 'SELECT * FROM anime_entries WHERE name ILIKE $1';
  const values = [`%${searchTerm}%`];
  try {
    const result = await pool.query(query, values);
    const popularAnime = await fetchPopularAnime();
    let userProfilePicture = null;
    if (req.session.userId) {
      const query = 'SELECT profile_picture FROM users WHERE id = $1';
      const values = [req.session.userId];
      const userResult = await pool.query(query, values);
      
      if (userResult.rows.length > 0) {
        userProfilePicture = userResult.rows[0].profile_picture;
      }
    }
    res.render('index', { entries: result.rows, userId: req.session.userId, popularAnime, userProfilePicture });
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.send('Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// IDEAS FOR THE WEBSITE:
// Profile pictures and have them carry over onto the logo.           PARTIAL.
// Fix anime names, change them from the codes to the actual names.
// Fix PFP bug in the /anime/ route, is being passed through but still wont load.
// Include WHERE the anime can be watched/streamed and maybe be able to click on it to direct u to the site. 