/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
const { gql } = require('apollo-server');
const { ApolloServer } = require('apollo-server-express');

//const log = process.stdout.write.bind(process.stdout);


// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    id: String!
    title: String
    author: String
    genre: String
    pages: Int
    publisher: String
  }

  type BookCollection {
    books: [Book]
    totalCount: Int
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    book(id: String): Book
    books(offset: Int, limit: Int): BookCollection
  }

  input BookInput {
    title: String
    author: String
    genre: String
    pages: Int
    publisher: String
  }
  type Mutation {
      createBook(book: BookInput!): Book
      updateBook(id: String!, book: BookInput!): Book
      deleteBook(id: String!): [String]
  }
`;

function sortBooks(books) {
    return books.sort( (b1,b2) => {
        const t1 = b1.title;
        const t2 = b2.title;
        if( t1 > t2) return 1;
        if( t1 < t2) return -1;
        return 0;
    });
}
const books = sortBooks(require("./books").books);
let nextBookId = books.length;

books.forEach( (item,i) => {item.id = "id_"+i.toString()});
books.findById = function findById(id) {
    return this.find((book) => {
        return book.id===id;
    });
}

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
      book: (parent, {id}) => {
          const r = books.findById(id);
          return r;
      },
      books: (parent, {offset,limit}) => {
        const start = offset||0
        const end = start + (limit||50)
        return {
            books: books.slice(start,end),
            totalCount: books.length
        }
      }
    },
    Mutation: {
        createBook: (root,{book}) => {
            const b = Object.assign({},book);
            b.id = "id_" + (nextBookId++);
            books.push(b);
            sortBooks(books);
            return b;
        },
        updateBook: (root,{id,book}) => {
            const b = books.findById(id);
            if(b) {
                Object.assign(b,book);
            }
            return b;
        },
        deleteBook: (root,{id}) => {
            const b = books.findById(id);
            if(b) {
                const idx = books.indexOf(b);
                books.splice(idx,1);
                return [id];
            }
            return [];
        },
    },
};

const server = new ApolloServer({
    // These will be defined for both new or existing servers
    typeDefs,
    resolvers,
    playground: {}
  });



function init(app) {
    server.applyMiddleware({ app });
}

module.exports = { init, server }
