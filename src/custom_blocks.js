import React from 'react';
import ReactDOM from 'react-dom';
import Blockly from 'node-blockly/browser';

import BlocklyDrawer, { Block, Category } from 'react-blockly-drawer'


export const helloWorld = {
    name: 'HelloWorld',
    category: 'Demo',
    block: {
        init: function () {
            this.jsonInit({
                message0: 'Hello %1',
                args0: [
                    {
                        type: 'field_input',
                        name: 'NAME',
                        check: 'String'
                    }
                ],
                output: 'String',
                colour: 160,
                tooltip: 'Says Hello'
            });
        },
        generator: (block) => {
            const message = `'${block.getFieldValue('NAME')}'` || '\'\'';
            const code = `console.log('Hello ${message}')`;
            return [code, Blockly.JavaScript.ORDER_MEMBER];
        }
    }
};

