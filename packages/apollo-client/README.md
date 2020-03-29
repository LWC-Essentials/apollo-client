# @lwce/apollo-client

Apollo GraphQL client for Lightning Web Components

This library is largely inspired from the Apollo React hooks, although because it uses wire-adapters, there are some differences.

***This library is currently in an experimental form and may change at any time***


## Use of wire adapters - Warning

Wire adapters are not yet fully documented in the open source version of LWC because their implementation might change over time. If it feels safe to use wire adapters from a consumer standpoint, the implementors might have to adapt their code when these changes will happen.


## Establishing the connection to the GraphQL server

The connection is established through the use of an Apollo client instance. Typically, as GraphQL aims to provide a single endpoint, an application should have one Apollo client created. It is important as such a client is also used to maintain a cache for the data.  

If the Apollo client can be passed with each wire adapter through the `client` property, the `@lwce/apollo-client` library also maintains a global Apollo client instance as a convenience. It can be accessed through its `setClient/getClient` functions:  

```javascript
// Register the global Apollo client when the application starts
setClient(new ApolloClient({
    uri: 'http://mygraphqlserver.com/graphql'
}));
```


## Running a query

A query can be executed using the `useQuery` wire adapter like bellow:  

```javascript
	const MYQUERY = gql`
        {
            books(limit: 5) {
                id
                title
            }
        }        
   `
   ...
   @wire(useQuery, {
        query: MYQUERY
    }) books;
```

Because of the current LWC compiler behavior, it is advised to isolate the GraphQL in a constant and then reference this constant. This generates more optimized code, as the LWC will repeat the query several times if not in a constant.  

Note: to make the wire adapter react on a variable value change, the whole `variables` object has to be replaced, as a change in a property is not detected (even when `@track`). For example, changing the offset should be done with code like:  

```javascript
    variables = {
        offset: 0,
        limit: 10
    }

    @wire(useQuery, {
        query: MYQUERY,
        variables: '$variables'
    }) books;

	 // Right way to update an object
    handleFirst() {
        this.variables = {
            ...this.variables,
            offset: 0
        }
    }
    
//    // This does not trigger a wire adapter change!
//    handleFirst() {
//        this.variables.offset = 0;
//    }
```  



### Query Results

The resulting data has the following members:  

```javascript
{
    loading,     // A boolean that indicates if the query is being loaded
    data,        // The data returned, can be null or undefined
    error,       // The data if any, can be null or undefined
    initialized, // A boolean that indicates if the query has been executed at least once 

    client,      // The apollo client being used
    fetch,       // Execute the query with optional variables
}
```  

Note that the wire adapter keeps watching for data changes using the Apollo `watchQuery` observable. If it detects changes, then it will update the component appropriately.  


### Query Options

The options are the one being used by the Apollo client [watchQuery()](https://www.apollographql.com/docs/react/api/apollo-client/#ApolloClient.watchQuery), with a new option:

```javascript
{
    client,  // The apollo client instance. If empty, it uses the globally registered one.
    lazy,    // Indicates that the query should not be executed right away, but later calling fetch()
}
``` 

The most notable existing options for the client are:  

- `query`: the GraphQL query to emit
- `variables`: the list of variables for the query


### Refetching the Query

Once initialized, the result provides a `fetch(variables)` function that can be used to execute the query again. In case of a `lazy` query, it must be called to get the data (the `initialized` can be checked to see if it already happened).  

Note that the React Hooks library named this function `refetch`, but it is named `fetch` here for consistency with other LWC projects.


### Lazy mode

The GraphQL request is automatically emitted when the wire adapter configuration is available, which means when the component is connected to the DOM. This works well for data needed by the component to display right away, typically a query. But, sometimes, the request should be executed manually. It applies to data requested on demand (list for a pop-up, ...).  The `fetch` method returns a `Promise` that will be resolved when the request is completed. At that time, the `@wire` member is updated with the latest data. Note that the Promise is also resolved when the update failed: just access the error member of the `@wire` member to check the status.

Here an example of a request executed on demand:
```javascript
    @wire(useQuery, {
        query: USERS,
        lazy: true
    }) users;

    readUsers() {
        this.users.fetch().then( () => {
            // Notification that the data has been updated
            // Do something with the @wire data member...
        })
    }
```  

To support that, the wire adapter offers a `lazy` mode. When set to `true`, the request is only executed with an explicit call to a `fetch()` method, provided as part of the @wire variable.  


## Executing a mutation

Mutations use the `useMutation` wire adapter:  

```javascript
    const MY_MUTATION = gql`
        mutation updateBook($id: String!, $book: BookInput!) {
            updateBook(id: $id, book: $book) {
                id
                title
            }
        }    
    `
    ...
    @wire(useMutation, {
        query: MY_MUTATION
    }) updateBook;
```  

Similarly to lazy queries, the requests is not executed when the component is initialized but must be executed explicitly. For this, the wire adapter will initialize the result and make available a `mutate` method to call:  

```javascript
    const variables = {
    	  id,
	     book: {
            title: "new title",
            author: "myself,
            ...
        }
    };
    this.bookCreate.mutate({
        variables
    });
```  

the `mutate` method also returns a promise to enable notification once a mutation has succeeded:
```javascript
    const variables = {
    	  id,
	     book: {
            title: "new title",
            author: "myself,
            ...
        }
    };
    this.bookDelete.mutate({
        variables
    }).then(() => {
        //some notification or alert or variable change
        this.showDeleteSuccessAlert = true;
     });
```  



### Mutation Results

The resulting data has the following members:  

```javascript
{
    loading,      // A boolean that indicates if the mutation is being executed
    data,         // The data returned, can be null or undefined
    error,        // The data if any, can be null or undefined
    initialized,  // A boolean that indicates if the query has been called once

    client,       // The apollo client being used
    mutate,       // The function to call for mutating the data
}
```  


### Mutation Options

The options are the one being used by the Apollo client [mutate()](https://www.apollographql.com/docs/react/api/apollo-client/#ApolloClient.mutate), with the following options added:

```javascript
{
    client,     // The apollo client instance. If empty, it uses the globally registered one.
}
```

The options are a merge between the global options defined at the `@wire` level, and the ones passed to the `mutate` method (the later overrides the former).  
