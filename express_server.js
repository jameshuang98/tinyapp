const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

// Installing a piece of middleware: body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs")
app.use(cookieParser());
app.use(express.static('/public')); // serve up static files in the public directory

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
}

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
}

app.get('/', (req, res) => {
    res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
    const templateVars = {user: users[req.cookies.user_id], urls: urlDatabase};
    res.render('urls_index', templateVars)
});

app.get("/urls/new", (req, res) => {
    const templateVars = {user: users[req.cookies.user_id], urls: urlDatabase};
    res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL/edit", (req, res) => {
    const templateVars = { user: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { user: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

app.get("/register", (req, res) => {
    const templateVars = { user: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    res.render("register", templateVars);
});

app.get("/login", (req, res) => {
    const templateVars = { user: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    res.render("login", templateVars);
});

// app.get("/hello", (req, res) => {
//     res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.post("/urls", (req, res) => {
    // console.log(req.body);  // Log the POST request body to the console
    let postValue = req.body; // Saving POST request body
    let randomString = generateRandomString(); // generating a random 6 character string
    urlDatabase[randomString] = postValue.longURL // Saving it to the urlDatabase
    res.redirect('/urls/' + randomString);
});

app.post('/urls/:shortURL/delete', (req,res) => {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req,res) => {
    const shortURL = req.params.shortURL;
    // console.log('req.body',req.body);
    const longURL = req.body.URL

    urlDatabase[shortURL] = longURL;
    res.redirect('/');
});

app.post('/login', (req,res) => {
    // const user_id = req.body.user_id;
    // console.log('req.body', req.body)
    res.cookie('user_id', user_id)
    res.redirect('/');
});

app.post('/logout', (req,res) => {
    res.clearCookie('user_id');
    res.redirect('/');
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
})

app.post('/register', (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    // console.log('req.body',req.body);
    const user_id = generateRandomString();

    if (!email || !password) {
        return res.status(400).send("email and password cannot be blank");
    }

    if(userInDatabase(email)) {
        return res.status(400).send("a user already exists with that email")
    }
  
    users[user_id] = {
        "id": user_id,
        "email": email,
        "password": password
    }

    res.cookie('user_id', user_id)
    console.log(users)
    res.redirect('/urls');
});

function generateRandomString() { 
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++ ) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
}

function userInDatabase(newEmail) {
    for (const user in users) {
        if (users[user].email === newEmail) {
            return true;
        }
    }
    return false;
}