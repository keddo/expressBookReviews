const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
   let userWithSameName = users.filter(user => {
      return user.username === username
   })
   return userWithSameName ? true : false
}

const authenticatedUser = (username,password)=>{ //returns boolean
   let  authUser = users.filter(user => {
      return user.username === username && user.password == password
   });
   return authUser ? true : false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: username
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,
      username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.data;
  const review = req.body.review; // Assuming the review text is in the request body

  // Find the book with the matching ISBN
  // const book = books.find((book) => book.id === parseInt(isbn));
  const book = Object.keys(books).filter(id => id === isbn).reduce((filteredBooks, bookId) =>  books[bookId], {})
  
  if (book) {
    // Add the review to the book's reviews
    book.reviews[username] = review;
    // Persist the updated books object (e.g., to a database)
    // ... (replace this with your persistence logic)

    res.status(200).json({book, message: "Review added successfully" });
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.data;

  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    // Check if the user has submitted any reviews for this book
    if (books[isbn].reviews[username]) {
      // Delete the user's review for the specified book
      delete books[isbn].reviews[username];
      res.status(200).json({ message: "Review deleted successfully" });
    } else {
      res.status(404).json({ message: "User's review not found for the specified book" });
    }
  } else {
    res.status(404).json({ message: "Book not found with the specified ISBN" });
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
