/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
import { getClient } from './client';
import ApolloClient, { MutationOptions, OperationVariables } from 'apollo-client';

//
// useMutation
//
// React useMutation reference:
//    https://www.apollographql.com/docs/react/api/react-hooks/#usemutation
//
//
interface DataCallback {
    (value: any): void;
}

export interface Options extends MutationOptions<any, OperationVariables> {
    client: ApolloClient<any>;
}

interface Result {
    loading:        boolean;
    data?:          any;
    error?:         string;
    initialized:    boolean;

    client:         ApolloClient<any>,
    mutate?:        (v:any) => void;
}

function errorString(error?: any): string|undefined {
    if(error) {
        if(Array.isArray(error)) {
            let s = "";
            for( let i of (error as []) ) {
                if(s) s+= "\n";
                s+=errorString(i);
            }
            return s;
        }
        if(typeof error!=='string') {
            error = error.toString();
        }
        return error;
    }
    return undefined;
}

export class useMutation {
    dataCallback: DataCallback;

    apolloOptions: MutationOptions<any, OperationVariables>|undefined
    connected:boolean = true
    pendingResult: Result

    constructor(dataCallback: DataCallback) {
        this.dataCallback = dataCallback;
        this.pendingResult = {
            client: undefined as unknown as ApolloClient<any>, // Trick - when sent to the component, it will be defined
            loading:false,
            data: undefined,
            error: undefined,
            initialized: false,
            mutate: this.mutate.bind(this)
        };
    }

    update(config: Record<string, any>) {
        const {client,...props} = config;
        this.apolloOptions = <MutationOptions<any, OperationVariables>>{...props};
        this.pendingResult.client = client||getClient();
        this.sendUpdate();
    }

    connect() {
        this.connected = true;
        this.sendUpdate();
    }

    disconnect() {
        this.connected = false;
    }


    sendUpdate() {
        if(this.connected) {
            // Make a copy to make the notification effective and prevent changes (ex: client instance)
            const o = Object.assign({},this.pendingResult);
            this.dataCallback(o);
        }
    }

    mutate(options: MutationOptions<any, OperationVariables>) {
        const mergedOptions = {...this.apolloOptions, ...options};
        this.pendingResult.loading = true;
        this.sendUpdate();
        // It is not necessary to return the Promise here, as the caller can use th on...() events
        return this.pendingResult.client.mutate(mergedOptions).then( ({ data, errors }) => {
            Object.assign( this.pendingResult, {
                loading: false,
                data,
                error:errorString(errors),
                initialized: true,
            });
            this.sendUpdate();
        }).catch( error => {
            Object.assign( this.pendingResult, {
                loading: false,
                data: undefined,
                error:errorString(error),
                initialized: true,
            });
            this.sendUpdate();
        });
    }
}
