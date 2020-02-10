/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
import { api } from 'lwc';
import FormField from '../form-field/form-field';

export default class Input extends FormField {

    @api type="text"

    get value() {
        return this.getValueAsString();
    }

    handleChange(event) {
        const v = event.target.value;
        this.setValueFromString(v);
    }
}
