const express = require('express');
let books = require("./booksdb.js");
const { users } = require('./auth_users.js');
// const books = require('./booksdb.js');
let isValid = require("./auth_users.js").isValid;
// let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  const doesObjectExist = users.find(user => user.username === username)
  if (username && password) {
     if(!doesObjectExist){
        users.push({username, password})
        return res.status(200).json({message: "User successfully registred. Now you can login"}); 
     }
     else {
        return res.status(404).json({message: "User already exists!"});
     }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',async  (req, res) => {
  try {
    const books = await fetchBooks()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // const isbn = req.params.isbn;
  // const book = Object.keys(books).filter(id => id == isbn).reduce((filteredBooks, bookId) =>  books[bookId], {})
  searchBookByISBN(isbn)
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      console.error(error);
      res.status(404).json(error); 
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  searchBooksByAuthor(author)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      console.error(error);
      res.status(404).json(error);
    });
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  // const book = Object.keys(books).filter(id => books[id].title === title).reduce((filteredBooks, bookId) =>  books[bookId], {})
  try {
    // Call the async function to search for books by title
    const books = await searchBooksByTitle(title);

    // Return the list of books by title as a JSON response
    res.status(200).json(books);
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    res.status(404).json(error); // Return a 404 status if no books are found with the title
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const review = Object.keys(books).filter(id => id === isbn).reduce((filteredBooks, bookId) =>  books[bookId].reviews, {})
  return res.status(200).json(review);
});

const fetchBooks = async () => {
  return books
}

const searchBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    const book = fetchBookByISBN(isbn);

    if (book) {
      resolve(book); // Resolve with the book details
    } else {
      reject({ error: 'Book not found' }); // Reject with an error if the book is not found
    }
  });
};

const fetchBookByISBN = (isbn) => {
  const book = books[isbn];
  return book;
};

const searchBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    // Assuming you have a function to fetch books by author, for example, fetchBooksByAuthor()
    const booksByAuthor = fetchBooksByAuthor(author);

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor); // Resolve with the list of books by the author
    } else {
      reject({ error: 'Books by this author not found' }); // Reject with an error if no books are found
    }
  });
};

const fetchBooksByAuthor = (author) => {
  const booksByAuthor = Object.values(books).filter(book => book.author === author);

  return booksByAuthor;
};


const searchBooksByTitle = async (title) => {
  // Assuming you have an async function to fetch books by title, for example, fetchBooksByTitle()
  const booksByTitle = await fetchBooksByTitle(title);

  if (booksByTitle.length > 0) {
    return booksByTitle; // Return the list of books by title
  } else {
    throw { error: 'Books with this title not found' }; // Throw an error if no books are found
  }
};

const fetchBooksByTitle = async (title) => {
  // Your logic to fetch books by title goes here
  // For example, you might filter the books in your 'books' object by the provided title
  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));

  return booksByTitle;
};
module.exports.general = public_users;
