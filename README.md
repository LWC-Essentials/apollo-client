# @lwce/apollo-client

[![npm version](https://img.shields.io/npm/v/@lwce/apollo-client?style=flat)](https://www.npmjs.com/package/@lwce/apollo-client)


`@lwce/apollo-client` is an Apollo GraphQL client for Lightning Web Components

**Note #1:** *Some of the components use the LWC wire adapter API, which is subject to change (see: https://github.com/salesforce/lwc-rfcs/blob/master/text/0103-wire-adapters.md). The library currently uses the LWC wire adapter API 1.1.x.*

**Note #2:** *This library is under development and can change any time until it reaches version 1.0. Contributions as ideas or code are obviously welcome!*

The project is a mono-repo where each feature is defined in its own package. As of today the available packages are the apollo-client library and the sample application.  


## Running the sample Application

The project contains a sample application that shows how to use the library. It has both a server side part, running NodeJS/express and the Apollo Server, as well as a client side part made with LWC and the Apollo client.

To run the application:  

```
yarn build
yarn serve
```  
  
Here is a video of the demo application:  

[![](http://img.youtube.com/vi/1TQdtL0cdwE/0.jpg)](http://www.youtube.com/watch?v=1TQdtL0cdwE "LWC Apollo Client")
