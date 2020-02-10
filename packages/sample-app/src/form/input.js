/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
import { LightningElement, api } from 'lwc';

export default class Input extends LightningElement {

    @api object;
    @api bind;

    @api type;
    @api style;
    @api class;
    @api placeholder;

    _getValue() {
        if(this.object && this.bind) {
            return this.object[this.bind]
        }
        return undefined;
    }
    _setValue(value) {
        if(this.object && this.bind) {
            this.object[this.bind] = value;
        }
    }

    valueAsString() {
        const value = this._getValue();
        if(value) {
            const t = this.type;
            if(t==="number") {
                return Number.toString();
            }
            return value.toString();
        }
        return "";
    }

    handleChange(event) {
        const input = event.target;
        const value = input.value;
        if(this.type==="number") {
            this._setValue(Number.parseFloat(value));
        } else {
            this._setValue(value);
        }
    }
}
