const express = require('express');
const router = express.Router();
const Game = require('../models/games'); // Assuming the Game model is correct

// Session setup (ensure this is configured properly)
const session = require('express-session');

router.use(
  session({
    secret: process.env.SECRET_URL,
    resave: false,
    saveUninitialized: true,
  })
);

// Homepage Route
router.get('/', async (req, res) => {
  console.log('Homepage');

  const page = req.session.pageNum || 0;
  req.session.pageNum = page;
  console.log(req.session.pageNum);

  // Initialize query
  let query = Game.find();

  // Search functionality
  if (req.query.searchTags) {
    query = Game.find({
      name: {
        $regex: new RegExp(req.query.searchTags, 'i'),
      },
    });
    req.session.pageNum = 0;
    req.session.query = req.query.searchTags;
  } else if (req.session.query) {
    query = Game.find({
      name: {
        $regex: new RegExp(req.session.query, 'i'),
      },
    });
    req.session.pageNum = 0;
    req.session.query = req.query.searchTags;
  }

  // Fetch games
  try {
    const items = await query.skip(req.session.pageNum * 3).limit(3).exec();
    res.render('homepage', {
      req: req,
      items: items,
    });
  } catch (err) {
    console.log('Error fetching games:', err);
    res.status(500).send('Error fetching games');
  }
});

// Pagination Logic

// Previous Page
router.get('/prev', async (req, res) => {
  if (req.session.pageNum > 0) {
    req.session.pageNum -= 1;
  }
  res.redirect('/');
});

// Next Page
router.get('/next', async (req, res) => {
  if (req.session.pageNum > -1 && req.session.pageNum < (await numberOfPages())) {
    req.session.pageNum += 1;
  }
  res.redirect('/');
});

// Utility function to count documents
async function countDocuments() {
  try {
    const count = await Game.countDocuments({});
    console.log(`Number of documents: ${count}`);
    return count;
  } catch (err) {
    console.error(err);
  }
  return 0;
}

// Determine number of pages
async function numberOfPages() {
  const num = await countDocuments();
  const pages = Math.floor(num / 3);
  return num % 3 === 0 ? pages - 1 : pages;
}

module.exports = router;
