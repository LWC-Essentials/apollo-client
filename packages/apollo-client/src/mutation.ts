/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
import { register, WireEventTarget, ValueChangedEvent } from '@lwc/wire-service';
import { getClient } from './client';
import ApolloClient, { MutationOptions, OperationVariables } from 'apollo-client';

//
// useMutation
//
// React useMutation reference:
//    https://www.apollographql.com/docs/react/api/react-hooks/#usemutation
//
//

export interface Options extends MutationOptions<any, OperationVariables> {
    client: ApolloClient<any>;
}

export const useMutation = Symbol('apollo-use-mutation');

interface Result {
    loading:        boolean;
    data?:          any;
    error?:         string;
    initialized:    boolean;

    client:         ApolloClient<any>,
    mutate?:        (v:any) => void;
}

register(useMutation, (eventTarget:WireEventTarget) => {
    let apolloOptions: MutationOptions<any, OperationVariables>, 
        connected:boolean = true,
        pendingResult: Result={
            client: undefined as unknown as ApolloClient<any>, // Trick - when sent to the component, it will be defined
            loading:false,
            data: undefined,
            error: undefined,
            initialized: false,
            mutate: mutate
        };

    function update() {
        if(connected) {
            // Make a copy to make the notification effective and prevent changes (ex: client instance)
            const o = Object.assign({},pendingResult);
            eventTarget.dispatchEvent(new ValueChangedEvent(o));
        }

    }

    function mutate(options: MutationOptions<any, OperationVariables>) {
        const mergedOptions = {...apolloOptions, ...options};
        pendingResult.loading = true;
        update();
        // It is not necessary to return the Promise here, as the caller can use th on...() events
        return pendingResult.client.mutate(mergedOptions).then( ({ data, errors }) => {
            Object.assign( pendingResult, {
                loading: false,
                data,
                error: errors,
                initialized: true,
            });
            update();
        }).catch( error => {
            Object.assign( pendingResult, {
                loading: false,
                data: undefined,
                error,
                initialized: true,
            });
            update();
        });
    }

    function handleConfig(options: Options) {
        const {client,...props} = options;
        apolloOptions = {...props};
        pendingResult.client = client||getClient();
        update();
    }

    function handleConnect() {
        connected = true;
        update();
    }

    function handleDisconnect() {
        connected = false;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout( function() {
            eventTarget.removeEventListener('disconnect', handleDisconnect);
            eventTarget.removeEventListener('connect', handleConnect);
            eventTarget.removeEventListener('config', handleConfig);
        });
    }

    eventTarget.addEventListener('config', handleConfig);
    eventTarget.addEventListener('connect', handleConnect);
    eventTarget.addEventListener('disconnect', handleDisconnect);
});

