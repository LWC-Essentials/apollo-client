/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/

// Do not use native shadow DOM as it breaks bootstrap
// This should be added before the LWC engine else it has some unpredictable results
import "@lwc/synthetic-shadow"

/* eslint-disable no-undef */
import { register } from "lwc";

// The wire service has to be registered once
import { registerWireService } from 'wire-service';
registerWireService(register)

// Import this web components to get them loaded and registered
import Body from "app/body";


// We use the apollo-boost lib here for convenience, but this is not required
// https://github.com/apollographql/apollo-client/tree/master/packages/apollo-boost
//import ApolloClient from 'apollo-boost';

// We cannot embed the Apollo client in the LWC compiler as it misses a .mjs transformer, required by graphql.js
// On the other hand, having the apollo-client isolated might make it perform better, as it can be cached independently
//  const ApolloClient = window.ApolloClient;
import { setClient } from '@lwce/apollo-client';

// Register a single Apollo client to be used through the whole application
setClient(new ApolloClient({
    uri: 'http://localhost:3001/graphql'
}));
