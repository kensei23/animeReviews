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

// Home page route
app.get('/', (req, res) => {
  // Select entries along with their like and dislike counts
  pool.query('SELECT *, likes - dislikes AS rating FROM anime_entries ORDER BY id DESC LIMIT 20', (err, result) => {
    if (err) {
      console.error('Error executing query', err.stack);
      res.send('Error');
    } else {
      res.render('index', { entries: result.rows, userId: req.session.userId });
    }
  });
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

// Profile page route
app.get('/profile', checkAuth, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    const entriesResult = await pool.query('SELECT *, likes - dislikes AS rating FROM anime_entries WHERE user_id = $1', [req.session.userId]);
    res.render('profile', { user: userResult.rows[0], userEntries: entriesResult.rows, userId: req.session.userId });
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

// Add entry form route
app.get('/add', checkAuth, (req, res) => {
  res.render('add');
});

// Add entry form submission route
app.post('/add', checkAuth, (req, res) => {
  const { name, progress, rating, summary, image_url } = req.body;
  const query = 'INSERT INTO anime_entries (name, progress, rating, summary, image_url, user_id) VALUES ($1, $2, $3, $4, $5, $6)';
  const values = [name, progress, rating, summary, image_url, req.session.userId];
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
app.get('/edit/:id', checkAuth, (req, res) => {
  const entryId = req.params.id;
  pool.query('SELECT * FROM anime_entries WHERE id = $1 AND user_id = $2', [entryId, req.session.userId], (err, result) => {
    if (err) {
      console.error('Error executing query', err.stack);
      res.send('Error');
    } else {
      res.render('edit', { entry: result.rows[0] });
    }
  });
});

// Edit entry form submission route
app.post('/edit/:id', checkAuth, (req, res) => {
  const entryId = req.params.id;
  const { name, progress, rating, summary, image_url } = req.body;
  const query = 'UPDATE anime_entries SET name = $1, progress = $2, rating = $3, summary = $4, image_url = $5 WHERE id = $6 AND user_id = $7';
  const values = [name, progress, rating, summary, image_url, entryId, req.session.userId];
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
app.get('/search', (req, res) => {
  const searchTerm = req.query.term;
  const query = 'SELECT * FROM anime_entries WHERE name ILIKE $1';
  const values = [`%${searchTerm}%`];
  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error executing query', err.stack);
      res.send('Error');
    } else {
      res.render('index', { entries: result.rows, userId: req.session.userId });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

