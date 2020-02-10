/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
import { LightningElement, api, track } from 'lwc';

export default class FormField extends LightningElement {

    @track formData;
    @api field


    //
    // Use dependency injection
    // Inspired by:
    //    https://www.youtube.com/watch?v=6o5zaKHedTE
    //    https://github.com/googlearchive/di-demo/blob/master/requester.html
    // Should later use, when available:
    //    https://github.com/salesforce/lwc-rfcs/blob/master/text/0000-context-service.md
    //
    connectedCallback() {
        const key = 'form-data';
        const event = new CustomEvent('request_context', {
          detail: {key},
          bubbles: true,
          cancelable: true,
        });
        this.dispatchEvent(event);
        if (event.defaultPrevented) {
          this.formData = event.detail.formData;
        } else {
          throw new Error(`no provider found for ${key}`);
        }
    }

    getData() {
        return this.formData && this.formData.data;
    }

    getValue() {
        if(this.getData() && this.field) {
            return this.getData()[this.field];
        }
        return undefined;
    }
    getValueAsString() {
        const v = this.getValue();
        if(v) {
            return v.toString();
        }
        return "";
    }

    setValue(value) {
        if(this.getData() && this.field) {
            this.getData()[this.field] = value;
        }
        return undefined;
    }
    setValueFromString(value) {
        if(value) {
            this.setValue(value);
        }
    }
}
