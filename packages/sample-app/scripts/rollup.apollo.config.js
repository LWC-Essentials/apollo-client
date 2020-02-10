/*
    Copyright (c) 2020, salesforce.com, inc.
    All rights reserved.
    SPDX-License-Identifier: BSD-3-Clause
    For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/
const path = require( 'path' );
const resolve = require( 'rollup-plugin-node-resolve' );
const builtins = require( 'rollup-plugin-node-builtins' );
const globals = require( 'rollup-plugin-node-globals' );
const commonjs = require( 'rollup-plugin-commonjs' );

const input = path.resolve( __dirname, '../src-libs/apollo-client.js' );
const outputDir = path.resolve(__dirname, '../public/js');

const { terser } = require('rollup-plugin-terser');

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

const plugins = [
    builtins(),
    globals(),
    resolve( {
        customResolveOptions: {
            moduleDirectory: 'node_modules'
        }
    } ),
    commonjs(),
    isProduction && terser()
];

module.exports = [ {
    input,
    output: {
        file: path.join(outputDir, 'apollo-client') + (isProduction ? ".min.js" : ".js"),
        format: 'iife',
    },
    plugins
} ];
