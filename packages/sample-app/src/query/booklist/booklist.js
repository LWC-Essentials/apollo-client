/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
import { LightningElement, wire, api } from 'lwc';

import { useQuery, useMutation } from '@lwce/apollo-client';

const BOOK_LIST = gql`
    query($offset: Int!, $limit: Int!) {
        books(offset: $offset, limit: $limit) {
            totalCount,
            books {
                id,
                title
                author,
                genre,
                publisher
            }
        }
    }`;

const BOOK_CREATE = gql`
    mutation createBook($book: BookInput!) {
        createBook(book: $book) {
            id
            title
            author
            genre
            publisher
        }
    }
`;

const BOOK_UPDATE = gql`
    mutation updateBook($id: String!, $book: BookInput!) {
        updateBook(id: $id, book: $book) {
            id
            title
            author
            genre
            publisher
        }
    }
`;
const BOOK_DELETE = gql`
    mutation deleteBook($id: String!) {
        deleteBook(id: $id)
    }
`;

export default class Booklist extends LightningElement {

    showDeleteSuccessAlert=false;
    showCreateSuccessAlert=false;
    showUpdateSuccessAlert=false;

    variables = {
        offset: 0,
        limit: 10
    }

    // Query
    @wire(useQuery, {
        query: BOOK_LIST,
        variables: '$variables'
    }) books;

    // Mutations
    @wire(useMutation, {
        mutation: BOOK_CREATE
    }) bookCreate;

    @wire(useMutation, {
        mutation: BOOK_UPDATE
    }) bookUpdate;

    @wire(useMutation, {
        mutation: BOOK_DELETE
    }) bookDelete;

    handleFirst() {
        this.variables = {
            ...this.variables,
            offset: 0
        }
    }
    handlePrev() {
        if(this.variables.offset>0) {
            this.variables = {
                ...this.variables,
                offset: this.variables.offset - this.variables.limit
            }
        }
    }
    handleNext() {
        if( (this.variables.offset+this.variables.limit)<this.books.data.books.totalCount ) {
            this.variables = {
                ...this.variables,
                offset: this.variables.offset + this.variables.limit
            }
        }
    }
    handleLast() {
        this.variables = {
            ...this.variables,
            offset: Math.floor(this.books.data.books.totalCount / this.variables.limit) * this.variables.limit
        }
    }
    handleRefetch() {
        this.books.fetch();
    }

    _findBookIdx(event) {
        for(let e=event.target; e; e=e.parentNode) {
            if(e.hasAttribute && e.hasAttribute("bookidx")) {
                return parseInt(e.getAttribute("bookidx"),10);
            }
        }
        return undefined;
    }


    handleCreate() {
        const dlg = this.template.querySelector('query-bookdialog');
        if(dlg) {
            const o = {}
            dlg.show(o).then( (action) => {
                if(action==="ok") {
                    const {...book} = o;
                    const variables = {
                        book: {
                            title: book.title,
                            author: book.author,
                            genre: book.genre,
                            publisher: book.publisher
                        }
                    };
                    // We violently reset the whole cache as the item order has changed
                    // If we only re-execute the current query, then the displayed page will be accurate while
                    // the other ones will not if they have been previously visited
                    this.bookCreate.client.resetStore();
                    this.bookCreate.mutate({
                        variables
                        // Reset the whole cache instead of re-executing the current query
                        // refetchQueries: [{
                        //     query: BOOK_LIST,
                        //     variables: this.variables
                        // }]
                    }).then(() => {
                        this.showCreateSuccessAlert = true;
                    });;
                }
            });
        }
    }
    handleUpdate(event) {
        const idx = this._findBookIdx(event);
        if(idx!==undefined) {
            // We cannot edit the book returned from the query as it is read-only (enforced by Apollo client)
            // We make a copy that we edit
            const o = JSON.parse(JSON.stringify(this.books.data.books.books[idx]));
            const dlg = this.template.querySelector('query-bookdialog');
            if(dlg) {
                dlg.show(o).then( (action) => {
                    if(action==="ok") {
                        const {id,...book} = o;
                        const variables = {
                            id,
                            book: {
                                title: book.title,
                                author: book.author,
                                genre: book.genre,
                                publisher: book.publisher
                            }
                        };
                        this.bookUpdate.mutate({variables}).then(() => {
                            this.showUpdateSuccessAlert = true;
                        });;
                    }
                });
            }
        }
    }
    handleDelete(event) {
        const idx = this._findBookIdx(event);
        if(idx!==undefined) {
            const id = this.books.data.books.books[idx].id;
            const variables = {
                id
            };
            // We violently reset the whole cache as the item order has changed
            // If we only re-execute the current query, then the displayed page will be accurate while
            // the other ones will not if they have been previously visited
            this.bookCreate.client.resetStore();
            this.bookDelete.mutate({
                variables
                // Reset the whole cache instead of re-executing the current query
                // refetchQueries: [{
                //     query: BOOK_LIST,
                //     variables: this.variables
                // }]
            }).then(() => {
                this.showDeleteSuccessAlert = true;
            });
        }
    }


    get pageNavigation() {
        if(this.books.data) {
            const page = this.variables.offset/this.variables.limit + 1;
            const total = this.books.data.books.totalCount/this.variables.limit + 1;
            return page.toFixed(0) + "/" + total.toFixed(0);
        }
        return "0/0";
    }

    get isError() {
        return this.books.error;
    }

    get isLoading() {
        return !this.books.initialized && this.books.loading;
    }
    get hasData() {
        return this.books.initialized && this.books.data;
    }


    get bookList() {
        return (this.books.data && this.books.data.books.books) || [];
    }

    get totalCount() {
        return (this.books.data && this.books.data.books.totalCount) || 0;
    }

    hideDeleteAlert() {
        this.showDeleteSuccessAlert = false;
    }

    hideCreateAlert() {
        this.showCreateSuccessAlert = false;
    }

    hideUpdateAlert() {
        this.showUpdateSuccessAlert = false;
    }
}
