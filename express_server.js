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

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
}

app.get('/', (req, res) => {
    res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
    const templateVars = {username: req.cookies.username, urls: urlDatabase};
    res.render('urls_index', templateVars)
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:shortURL/edit", (req, res) => {
    const templateVars = { username: req.cookies.username, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { username: req.cookies.username, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
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
    const longURL = urlDatabase[shortURL]
    delete urlDatabase[shortURL]

    const newURL = generateRandomString();
    urlDatabase[newURL] = longURL;
    res.redirect('/');
});

app.post('/login', (req,res) => {
    const username = req.body.username;
    console.log('req.body', req.body)
    res.cookie('username', username)
    res.redirect('/');
});

app.post('/logout', (req,res) => {
    res.clearCookie('username');
    console.log(req.cookies)
    res.redirect('/');
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
})

function generateRandomString() { 
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++ ) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
}