if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path'); // Include path module
const app = express();
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

// Create routes
const indexRouter = require('./routes/index');

// session
const session = require('express-session');

// Set up passport
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

app.use(session({
secret: process.env.SECRET_URL, // Change this to a secure random key
resave: false,
saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

var User = require('./models/users');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout');
app.use(expressLayouts);

// Serve static files from the 'assets' folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));

// Use Routes
app.use('/', indexRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
