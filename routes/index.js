const express = require('express')
const router = express.Router()
var passport = require('passport');

// Models
const Game = require('../models/games')
const User = require('../models/users')

// Session
const session = require('express-session');

router.use(session({
    secret: process.env.SECRET_URL, 
    resave: false,
    saveUninitialized: true,
}));

// Authenticated Index

// Index
router.get('/', async (req, res) => {
    console.log('Homepage');
    const page = req.session.pageNum || 0;

    req.session.pageNum = page

    console.log(req.session.pageNum)

    // search functions
    let query = Game.find()

    if (req.query.searchTags != null) {
        query = Game.find({name: { 
            $regex: new RegExp(req.query.searchTags, 'i') 
        }
        })
        req.session.pageNum = 0
        req.session.query = req.query.searchTags 
    } else if (req.session.query != '' && req.session.query != null) {
        query = Game.find({name: { 
            $regex: new RegExp(req.session.query, 'i') 
        }
        })
        req.session.pageNum = 0
        req.session.query = req.query.searchTags 
    }

    // Set up the games
    try {
        const items = await query.skip(req.session.pageNum * 3).limit(3).exec()      

        res.render('index', {
            req: req,
            items: items
        });
    } catch {
        console.log('error')
    }
})

// Previous
router.get('/prev', async (req, res) => {
    if (req.session.pageNum > 0) {
        req.session.pageNum -= 1
    }
    res.redirect('/')
})

// Next
router.get('/next', async (req, res) => {
    if (req.session.pageNum > -1 && req.session.pageNum < await numberOfPages()) {
        req.session.pageNum += 1
    }
    res.redirect('/')
})


// Login GET
router.get('/login', (req, res) => {
    console.log('Login');
    res.render('login', {
        req: req,
        error: "",
        username: req.body.username,
        password: req.body.password,
    });
})

// Login POST
router.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    
    req.login(user, function (err) {
        if (err) {
            console.log(err);
            res.render('login', {
                req: req,
                username: req.body.username,
                password: req.body.password,
                error : 'Incorrect username or password'
            });
        } else {
          passport.authenticate("local",{
            failureRedirect: "/login"
            })(req, res, function () {
                res.redirect('/')
          });
        }
    });
});
 
 
// Register GET
router.get('/register', (req, res) => {
    console.log('Register');
    res.render('register', {
        error: '',
        req: req
    });
})

// Register POST user
router.post('/register', (req, res) => {
    console.log('Register POST');

    const user = new User({ username : req.body.username})

    User.register(user, req.body.password, function(err, account) {
        if (err) {
            console.log(err)
            res.render('register', {
                error: 'Error in register',
                req: req
            })
        }

        passport.authenticate('local')(req, res, async function () {
            await user.save()
            console.log('successful')
            res.redirect('/');
        });
    });
})

// Logout POST
router.get('/logout',  async (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})

// Games
router.get('/game/:id',  ensureAuthenticated, checkSubscription, async (req, res) => {
    const game = await Game.findById(req.params.id)

    res.render('game', {
        req: req,
        game: game
    });
})

// Profile Subscription
router.get('/profile/:id',  ensureAuthenticated, async (req, res) => {
    res.render('profile', {
        req: req
    });
})

// Buy Subscription Plan
router.get('/plans', async (req, res) => {
    res.render('plans', {
        req: req
    });
})

// Subscribe GET
router.get('/subscribe', ensureAuthenticated, async (req, res) => {
    console.log(req.user.dateSub)
    console.log(req.user.checkSub)

    res.render('subscribe', {
        req: req
    });
})

// Subscribe POST
router.post('/subscribe', ensureAuthenticated, async (req, res) => {
    const user = await User.findById(req.user._id)

    if (req.user.checkSub) {
        user.dateSub = addDays(user.dateSub, 30)
    } else {
        user.dateSub = user.newDate
    }

    await user.save()

    res.redirect(`/profile/${req.user._id}`)
})


// Authentication
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {    
        return next();
    }
    res.redirect('/login');
}

// Check subscription
function checkSubscription(req, res, next) {
    if (req.user.checkSub) {    
        return next();
    }
    res.redirect('/plans');
}

// Function to add 30 days to dateSub
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// count number of documents
async function countDocuments() {
    try {
      const count = await Game.countDocuments({});
      console.log(`Number of documents: ${count}`);

      return count
    } catch (err) {
      console.error(err);
    }
    return null
}

// get num of pageNum 
async function numberOfPages() {
    const num = await countDocuments()
    const newNum = parseInt(num / 3)

    if (num % 3 == 0) {
        return newNum - 1
    } 

    return newNum
}

module.exports = router