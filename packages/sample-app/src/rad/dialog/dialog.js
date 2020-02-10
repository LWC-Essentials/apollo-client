/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
import { LightningElement, track, api } from 'lwc';

export const ACTION_CANCEL = "cancel";

function createPromise() {
    let _resolve, _reject;
    const promise = new Promise(function(resolve, reject){
      _resolve = resolve;
      _reject = reject;
    })
    promise.resolve = _resolve;
    promise.reject = _reject;
    return promise;
}


export default class Dialog extends LightningElement {

    title = ""

    // This should not change
    @track formData = {
        data: undefined,
        error: undefined
    };

    _closePromise;
    _modal;

    connectedCallback() {
        this.addEventListener('request_context', (event) => {
            const key = event.detail.key;
            if (key==="form-data") {
                event.detail.formData = this.formData;
                event.preventDefault();
                event.stopPropagation();
            }
        })
    }

    renderedCallback() {
        if(this._modal) {
            return;
        }
        this._modal = $(this.template.querySelector('.modal'));
        if(this._modal) {
            this._modal.on('hidden.bs.modal', () => {
                this._closePromise.resolve(this._closePromise.action);
                this._closePromise = undefined;
            });
        }
    }

    @api show(data) {
        if(this._modal && !this._closePromise) {
            this._closePromise = new createPromise();
            this._closePromise.action = ACTION_CANCEL;
            Object.assign( this.formData, {
                data,
                error: undefined
            });
            this._modal.modal('show');
            return this._closePromise;
        }
    }

    @api hide(action) {
        if(this._modal && this._closePromise) {
            this._closePromise.action = action || ACTION_CANCEL;
            Object.assign( this.formData, {
                data: undefined,
                error: undefined
            });
            this._modal.modal('hide');
        }
    }

}
