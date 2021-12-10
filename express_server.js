const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Importing helper functions
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers.js');

// Replaces cookie-parser with cookie-session
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

// Installing a piece of middleware: body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ["I like potatoes, cheese and gravy", "key"],
}));

// Database of URLs
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  },
  slk123: {
    longURL: "www.example.edu",
    userID: "123123"
  }
};

// Database of users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "hello@gmail.com",
    password: bcrypt.hashSync("hello")
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "123@gmail.com",
    password: bcrypt.hashSync("123")
  }
};

// GETs
app.get('/', (req, res) => {
  const userID = req.session.userID;
  if (!userID || !users[userID]) {
    return res.redirect("/login");
  }

  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// List of urls
app.get("/urls", (req, res) => {
  let urlsAllowed = urlsForUser(req.session.userID, urlDatabase);
    
  const templateVars = {user: users[req.session.userID], urls: urlsAllowed };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!userID || !users[userID]) {
    return res.redirect('/login');
  }

  const templateVars = {user: users[userID], urls: urlDatabase};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;

  const userID = req.session.userID;
  if (!userID || !users[userID]) {
    return res.status(403).send('Must be logged in');
  }

  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(403).send("URL does not exist");
  }

  if (url.userID !== userID) {
    return res.status(403).send('You do not own this URL');
  }

  const templateVars = { user: users[userID], shortURL, longURL: urlDatabase[shortURL].longURL};
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;

  const userID = req.session.userID;
  if (!userID || !users[userID]) {
    return res.status(403).send('Must be logged in');
  }

  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(403).send("URL does not exist");
  }

  if (url.userID !== userID) {
    return res.status(403).send('You do not own this URL');
  }
    
  const templateVars = { user: users[userID], shortURL: shortURL, longURL: urlDatabase[shortURL].longURL};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(403).send("URL does not exist");
  }

  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userID = req.session.userID;
  if (userID || users[userID]) {
    return res.redirect('/urls');
  }

  const templateVars = { user: users[userID]};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session.userID;
  if (userID || users[userID]) {
    return res.redirect('/urls');
  }

  const templateVars = { user: users[userID]};
  res.render("login", templateVars);
});

// POSTs
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!userID || !users[userID]) {
    return res.status(403).send('Must be logged in');
  }

  let postValue = req.body; // Saving POST request body
  let randomString = generateRandomString(); // generating a random 6 character string
  urlDatabase[randomString] = {longURL: postValue.longURL, userID: req.session.userID}; // Saving it to the urlDatabase
  res.redirect('/urls/' + randomString);
});

app.post('/urls/:shortURL/delete', (req,res) => {
  const shortURL = req.params.shortURL;

  const userID = req.session.userID;
  if (!userID || !users[userID]) {
    return res.status(403).send('Must be logged in');
  }

  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(403).send("URL does not exist");
  }

  if (url.userID !== userID) {
    return res.status(403).send('You do not own this URL');
  }
   
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req,res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.URL;
  const userID = req.session.userID;

  if (!userID || !users[userID]) {
    return res.status(403).send('Must be logged in');
  }

  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(403).send("URL does not exist");
  }

  if (url.userID !== userID) {
    return res.status(403).send('You do not own this URL');
  }

  url.longURL = longURL;
  res.redirect('/');
});

app.post('/login', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
    
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  if (!getUserByEmail(email, users)) {
    return res.status(403).send("no user found with that email");
  }

  let id = getUserByEmail(email, users);
  if (!(bcrypt.compareSync(password, users[id].password))) {
    return res.status(403).send("password does not match");
  }

  req.session.userID = id;
  res.redirect('/');
});

app.post('/logout', (req,res) => {
  req.session = null; // Deletes cookies completely
  res.redirect('/');
});

app.post('/register', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();

  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("a user already exists with that email");
  }
  
  users[userID] = {
    "id": userID,
    "email": email,
    "password": hashedPassword
  };

  req.session.userID = userID;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});