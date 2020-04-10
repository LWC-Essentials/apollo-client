/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
import { register, ValueChangedEvent, WireEventTarget } from '@lwc/wire-service';
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

export interface Options extends WatchQueryOptions {
    client: ApolloClient<any>;
    lazy: boolean;
}

export const useQuery = Symbol('apollo-use-query');

interface Result {
    loading:        boolean;
    data?:          any;
    error?:         string;
    initialized:    boolean;

    client:         ApolloClient<any>;
    fetch?:         (v:any) => void;
}

register(useQuery, (eventTarget: WireEventTarget) => {
    let connected: boolean,
        apolloOptions: WatchQueryOptions,
        observableQuery: ObservableQuery<ApolloQueryResult<any>,OperationVariables>,
        subscription: ZenObservable.Subscription,
        pendingResult: Result={
            client: undefined as unknown as ApolloClient<any>, // Trick - when sent to the component, it will be defined
            loading:false,
            data: undefined,
            error: undefined,
            initialized: false,
            fetch: fetch
        };

    function update() {
        if(connected) {
            // Make a copy to make the notification effective and prevent changes (ex: client instance)
            const o = Object.assign({},pendingResult);
            eventTarget.dispatchEvent(new ValueChangedEvent(o));
        }
    }

    function fetch(options?: Options) {
        const mergedOptions = {...apolloOptions, ...options};
        pendingResult.loading = true;
        update();
        try {
            if(subscription) {
                subscription.unsubscribe();
            }
            observableQuery =  pendingResult.client.watchQuery(mergedOptions);
            subscription = observableQuery.subscribe(({ data, loading, errors }) => {
                Object.assign(pendingResult, {
                    loading,
                    data,
                    error: errors,
                    initialized: true
                })                
                update();
            });
        } catch (error) {
            Object.assign(pendingResult, {
                loading: false,
                data: undefined,
                error,
                initialized: true
            })
            update();
        }
    }

    function handleConfig(options: Options) {
        const {client,lazy, ...props} = options;
        apolloOptions = props;
        pendingResult.client = client||getClient();
        if(!lazy) {
            fetch();
        } else {
            update();
        }
    }

    function handleConnect() {
        connected = true;
        update();
    }

    function handleDisconnect() {
        connected = false;
        if(subscription) {
            subscription.unsubscribe();
        }
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout( function() {
            eventTarget.removeEventListener('disconnect', handleDisconnect);
            eventTarget.removeEventListener('connect', handleConnect);
            eventTarget.removeEventListener('config', handleConfig);
        });
    }

    // Connect the wire adapter
    eventTarget.addEventListener('config', handleConfig);
    eventTarget.addEventListener('connect', handleConnect);
    eventTarget.addEventListener('disconnect', handleDisconnect);
});
