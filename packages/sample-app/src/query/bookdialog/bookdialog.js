/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
import Dialog from "../../rad/dialog/dialog";

export default class BookDialog extends Dialog {

    constructor() {
        super();
        this.title = "Book"
    }

    handleSave() {
        this.hide("ok");
    }
}
