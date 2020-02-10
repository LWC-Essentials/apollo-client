/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
//
// Reference the Apollo client to use
//
import { ApolloClient } from "apollo-client";

const APOLLO_KEY = "__lwcapolloc_client__";

export function getClient() {
    return (window as any)[APOLLO_KEY];
}

export function setClient(client: ApolloClient<any>) {
    return (window as any)[APOLLO_KEY] = client;
}
