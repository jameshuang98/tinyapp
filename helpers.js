// If the user is registered in the database, this function will use its email to find its ID
function getUserByEmail(newEmail, database) {
  for (const user in database) {
    if (database[user].email === newEmail) {
      return database[user].id;
    }
  }
}

// If the user is registered in the database, this function will use its email to find its ID
const urlsForUser = function(id, database) {
  let visibleURL = {};
  for (const url in database) {
    if (database[url].userID === id) {
      visibleURL[url] = {userID: id, longURL: database[url].longURL};
    }
  }
  return visibleURL;
};

// Generates a random string of 6 characters
const generateRandomString = function() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString
};