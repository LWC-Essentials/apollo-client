/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
import { getClient } from './client';
import { ApolloClient, WatchQueryOptions, ObservableQuery, OperationVariables, ApolloQueryResult } from "apollo-client";

//
// useQuery/useLazyQuery
//
// React useQuery reference:
//    https://www.apollographql.com/docs/react/api/react-hooks/#usequery
// React useLazyQuery reference:
//    https://www.apollographql.com/docs/react/api/react-hooks/#uselazyquery
//

interface DataCallback {
    (value: any): void;
}

export interface Options extends WatchQueryOptions {
    client: ApolloClient<any>;
    lazy: boolean;
}

interface Result {
    loading:        boolean;
    data?:          any;
    error?:         string;
    initialized:    boolean;

    client:         ApolloClient<any>;
    fetch?:         (v:any) => void;
}

export class useQuery {
    dataCallback: DataCallback;

    connected: boolean = false;
    apolloOptions: WatchQueryOptions|undefined;
    observableQuery: ObservableQuery<ApolloQueryResult<any>,OperationVariables>|undefined;
    subscription: ZenObservable.Subscription|undefined;
    pendingResult: Result;

    constructor(dataCallback: DataCallback) {
        this.dataCallback = dataCallback;
        this.pendingResult = {
            client: undefined as unknown as ApolloClient<any>, // Trick - when sent to the component, it will be defined
            loading:false,
            data: undefined,
            error: undefined,
            initialized: false,
            fetch: this.fetch.bind(this)
        }    
    }

    update(config: Record<string, any>) {
        const {client,lazy, ...props} = config;
        this.apolloOptions = <WatchQueryOptions>props;
        this.pendingResult.client = client||getClient();
        if(!lazy) {
            this.fetch();
        } else {
            this.sendUpdate();
        }
    }

    connect() {
        this.connected = true;
        this.sendUpdate();
    }

    disconnect() {
        this.connected = false;
        if(this.subscription) {
            this.subscription.unsubscribe();
        }
    }


    sendUpdate() {
        if(this.connected) {
            // Make a copy to make the notification effective and prevent changes (ex: client instance)
            const o = Object.assign({},this.pendingResult);
            this.dataCallback(o);
        }
    }

    fetch(options?: Options) {
        const mergedOptions = <WatchQueryOptions>{...this.apolloOptions, ...options};
        this.pendingResult.loading = true;
        this.sendUpdate();
        try {
            if(this.subscription) {
                this.subscription.unsubscribe();
            }
            this.observableQuery =  this.pendingResult.client.watchQuery(mergedOptions);
            this.subscription = this.observableQuery.subscribe(({ data, loading, errors }) => {
                Object.assign(this.pendingResult, {
                    loading,
                    data,
                    error: errors,
                    initialized: true
                })
                this.sendUpdate();
            });
        } catch (error) {
            Object.assign(this.pendingResult, {
                loading: false,
                data: undefined,
                error,
                initialized: true
            })
            this.sendUpdate();
        }
    }
}
