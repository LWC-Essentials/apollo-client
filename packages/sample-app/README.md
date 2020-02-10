# Sample Application

The sample application shows how to use the @lwce/apollo-client library to connect to a GraphQL server and execute CRUD operations. To run the sample application, execute the following commands from the root project:  

```
yarn build
yarn start
```  

Or to run in watch mode (development mode):  

```
yarn start
```  

Then launch your browser with the following URL:
[http://localhost:3001/](http://localhost:3001/)

[![](http://img.youtube.com/vi/1TQdtL0cdwE/0.jpg)](http://www.youtube.com/watch?v=1TQdtL0cdwE "LWC Apollo Client")


## Main application

The application shows CRUD operations on a virtual book database. The database is maintained in memory by the server, and exposed through an Apollo server instance. The GraphQL schema exposes queries and mutations to read, update, create and delete books.


### Apollo Client Cache

The application uses the default Apollo client `InMemoryCache`. As such, and because the update mutation returns the book id and all the changed fields, the cache is automatically updated. Note that there is still a potential issue, as the books are sorted by title on the server and changing the title locally may lead to a bad ordering in the client.  

For both create and delete mutations, the client cache is fully discarded to display fresh data. Although this is accurate from a data management standpoint, it can probably be optimized - any idea is welcome!


### RAD Library

The sample application contains some widgets that help building a UI using LWC and Bootstrap. This is experimental and will drastically change over time, so avoid relying on it!
