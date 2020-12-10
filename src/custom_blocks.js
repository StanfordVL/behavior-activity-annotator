import React from 'react'
import Blockly from 'node-blockly/browser';
import BlocklyDrawer, { Block, Category } from 'react-blockly-drawer'
import flatten from 'flat'


/* RELEVANT OBJECTS */
const sceneObjects = require('./pack_lunch_objects.json');
const objectLabelToCategory = {           // TODO get from selection (which is also a TODO)
    'apple1': 'apple', 
    'apple2': 'apple', 
    'apple3': 'apple', 
    'chicken1': 'chicken',
    'chicken2': 'chicken',
    'chicken3': 'chicken',
    'chicken4': 'chicken',
    'bowl1': 'bowl',
    'bowl2': 'bowl',
    'bowl3': 'bowl',
}

const objectCategoryToProperties = {        // TODO get from object category -> property annotation
    // TODO this should turn properties into descriptors and adds tags to descriptors 
    'apple': ['cooked', 'scrubbed'],
    'chicken': ['cooked', 'scrubbed'],
    'bowl': ['scrubbed', 'broken']
}

function generateDropdownArray(labels) {
    return(labels.map(label => [label, label.toUpperCase()]))
}

// getAllCategories(objectsArray) {
//     Object.keys(flatObjects).forEach(k => {
//         if (!(flatObjects[k] instanceof Array)) {
//             console.log(flatObjects[k]);     // TODO append to array rather than logging
//         }
//     })
// };


/* COLORS */
const sentenceConstructorColor = "#D39953";
const basicSentenceColor = "#853C41";
const rootColor = "#2A415F"


// export const root = {
//     name: 'Root',
//     category: 'Root', 
//     block: {
//         init: function() {
//             this.jsonInit({
//                 message
//             })
//         }
//     }
// }

// Blockly.Blocks['high_level_root'] = {
//     /**
//      * Block for creating a list with any number of elements of any type.
//      * @this {Blockly.Block}
//      */
//     init: function() {
//       this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
//       this.setStyle('list_blocks');
//       this.itemCount_ = 3;
//       this.updateShape_();
//       this.setOutput(true, 'Array');
//       this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
//       this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_TOOLTIP']);
//     },
//     /**
//      * Create XML to represent list inputs.
//      * @return {!Element} XML storage element.
//      * @this {Blockly.Block}
//      */
//     mutationToDom: function() {
//       var container = Blockly.utils.xml.createElement('mutation');
//       container.setAttribute('items', this.itemCount_);
//       return container;
//     },
//     /**
//      * Parse XML to restore the list inputs.
//      * @param {!Element} xmlElement XML storage element.
//      * @this {Blockly.Block}
//      */
//     domToMutation: function(xmlElement) {
//       this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
//       this.updateShape_();
//     },
//     /**
//      * Populate the mutator's dialog with this block's components.
//      * @param {!Blockly.Workspace} workspace Mutator's workspace.
//      * @return {!Blockly.Block} Root block in mutator.
//      * @this {Blockly.Block}
//      */
//     decompose: function(workspace) {
//       var containerBlock = workspace.newBlock('lists_create_with_container');
//       containerBlock.initSvg();
//       var connection = containerBlock.getInput('STACK').connection;
//       for (var i = 0; i < this.itemCount_; i++) {
//         var itemBlock = workspace.newBlock('lists_create_with_item');
//         itemBlock.initSvg();
//         connection.connect(itemBlock.previousConnection);
//         connection = itemBlock.nextConnection;
//       }
//       return containerBlock;
//     },
//     /**
//      * Reconfigure this block based on the mutator dialog's components.
//      * @param {!Blockly.Block} containerBlock Root block in mutator.
//      * @this {Blockly.Block}
//      */
//     compose: function(containerBlock) {
//       var itemBlock = containerBlock.getInputTargetBlock('STACK');
//       // Count number of inputs.
//       var connections = [];
//       while (itemBlock) {
//         connections.push(itemBlock.valueConnection_);
//         itemBlock = itemBlock.nextConnection &&
//             itemBlock.nextConnection.targetBlock();
//       }
//       // Disconnect any children that don't belong.
//       for (var i = 0; i < this.itemCount_; i++) {
//         var connection = this.getInput('ADD' + i).connection.targetConnection;
//         if (connection && connections.indexOf(connection) == -1) {
//           connection.disconnect();
//         }
//       }
//       this.itemCount_ = connections.length;
//       this.updateShape_();
//       // Reconnect any child blocks.
//       for (var i = 0; i < this.itemCount_; i++) {
//         Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
//       }
//     },
//     /**
//      * Store pointers to any connected child blocks.
//      * @param {!Blockly.Block} containerBlock Root block in mutator.
//      * @this {Blockly.Block}
//      */
//     saveConnections: function(containerBlock) {
//       var itemBlock = containerBlock.getInputTargetBlock('STACK');
//       var i = 0;
//       while (itemBlock) {
//         var input = this.getInput('ADD' + i);
//         itemBlock.valueConnection_ = input && input.connection.targetConnection;
//         i++;
//         itemBlock = itemBlock.nextConnection &&
//             itemBlock.nextConnection.targetBlock();
//       }
//     },
//     /**
//      * Modify this block to have the correct number of inputs.
//      * @private
//      * @this {Blockly.Block}
//      */
//     updateShape_: function() {
//       if (this.itemCount_ && this.getInput('EMPTY')) {
//         this.removeInput('EMPTY');
//       } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
//         this.appendDummyInput('EMPTY')
//             .appendField(Blockly.Msg['LISTS_CREATE_EMPTY_TITLE']);
//       }
//       // Add new inputs.
//       for (var i = 0; i < this.itemCount_; i++) {
//         if (!this.getInput('ADD' + i)) {
//           var input = this.appendValueInput('ADD' + i)
//               .setAlign(Blockly.ALIGN_RIGHT);
//           if (i == 0) {
//             input.appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
//           }
//         }
//       }
//       // Remove deleted inputs.
//       while (this.getInput('ADD' + i)) {
//         this.removeInput('ADD' + i);
//         i++;
//       }
//     }
//   };

export const basicUnarySentence = {
    name: 'BasicUnarySentence',
    category: 'Basic Sentences',
    block: {
        init: function () {
            this.jsonInit({
                message0: '%1 is %2', 
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'OBJECT',
                        options: generateDropdownArray(Object.keys(objectLabelToCategory))
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DESCRIPTOR',
                        options: generateDropdownArray(objectCategoryToProperties['apple'])
                    }
                ],
                output: null,
                colour: basicSentenceColor,
                tooltip: 'Applies a descriptor to an object'
            });
        },
        generator: (block) => {
            const message = `'${block.getFieldValue('DESCRIPTOR')}'` || '\'\'';
            console.log('MESSAGE:', message)
            // const code = `console.log('Hello ${message}')`;
            const code = 'print("hello world")'
            return [code, Blockly.Python.ORDER_MEMBER];
        }
    }
};


export const basicBinarySentence = {
    name: 'BasicBinarySentence',
    category: 'Basic Sentences',
    block: {
        init: function () {
            this.jsonInit({
                message0: '%1 is %2 %3',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'OBJECT1',
                        options: generateDropdownArray(Object.keys(objectLabelToCategory))
                    },
                    {
                        type: 'field_dropdown',
                        name: 'DESCRIPTOR',
                        options: generateDropdownArray(['on top of', 'inside', 'next to', 'under'])
                    },
                    {
                        type: 'field_dropdown',
                        name: 'OBJECT2',
                        options: generateDropdownArray(Object.keys(objectLabelToCategory))      //  need to eliminate the object already being used 
                    }
                ],
                output: "Boolean",
                colour: basicSentenceColor,
                tooltip: 'Applies a descriptor to an object'
            });
        },
        generator: (block) => {
            const message = `'${block.getFieldValue('DESCRIPTOR')}'` || '\'\'';
            console.log('MESSAGE:', message)
            // const code = `console.log('Hello ${message}')`;
            const code = 'print("hello world")'
            return [code, Blockly.Python.ORDER_MEMBER];
        }
    }   
};


export const conjunction = {
    name: 'Conjunction',
    category: 'Sentence Constructors',
    block: {
        init: function () {
            this.jsonInit({
                message0: '%1 and %2',
                args0: [
                    {
                        type: 'input_value',
                        name: 'CONJUNCT1',
                    },
                    {
                        type: 'input_value',
                        name: 'CONJUNCT2',
                    }
                ],
                output: "Boolean",
                colour: sentenceConstructorColor,
                tooltip: 'Applies a descriptor to an object',
                // inputsInline: true
            });
        },
        generator: (block) => {
            const message = `'${block.getFieldValue('DESCRIPTOR')}'` || '\'\'';
            console.log('MESSAGE:', message)
            // const code = `console.log('Hello ${message}')`;
            const code = 'print("hello world")'
            return [code, Blockly.Python.ORDER_MEMBER];
        }
    }   
};


export const disjunction = {
    name: 'Disjunction',
    category: 'Sentence Constructors',
    block: {
        init: function () {
            this.jsonInit({
                message0: '%1 or %2',
                args0: [
                    {
                        type: 'input_value',
                        name: 'DISJUNCT1',
                        check: "Boolean"
                    },
                    {
                        type: 'input_value',
                        name: 'DISJUNCT2',
                        check: "Boolean"
                    }
                ],
                output: "Boolean",
                colour: sentenceConstructorColor,
                tooltip: 'Applies a descriptor to an object',
            });
        },
        generator: (block) => {
            const message = `'${block.getFieldValue('DESCRIPTOR')}'` || '\'\'';
            console.log('MESSAGE:', message)
            // const code = `console.log('Hello ${message}')`;
            const code = 'print("hello world")'
            return [code, Blockly.Python.ORDER_MEMBER];
        }
    }   
};


export const negation = {
    name: 'Negation',
    category: 'Sentence Constructors',
    block: {
        init: function () {
            this.jsonInit({
                message0: "not %1",
                args0: [
                  {
                    type: "input_value",
                    name: "BOOL",
                    check: "Boolean"
                  }
                ],
                output: "Boolean",
                colour: sentenceConstructorColor
            })
        }
    }
}


export const universal = {
    // TODO second arg sentence has to have category, not object instance 

    name: 'Universal',
    category: 'Sentence Constructors',
    block: {
        init: function () {
            this.jsonInit({
                message0: "for all %1: %2",
                args0: [
                    {
                        type: "field_dropdown",
                        name: "CATEGORY", 
                        options: generateDropdownArray(Object.keys(objectCategoryToProperties))
                    },
                    {
                        type: "input_value", 
                        name: "SENTENCE",
                        check: "Boolean"
                    }
                ],
                output: "Boolean", 
                colour: sentenceConstructorColor
            })
        }
    }
}


export const existential = {
    // TODO second arg sentence has to have category, not object instance 

    name: 'Existential',
    category: 'Sentence Constructors',
    block: {
        init: function () {
            this.jsonInit({
                message0: "there exists some %1 such that %2",
                args0: [
                    {
                        type: "field_dropdown",
                        name: "CATEGORY", 
                        options: generateDropdownArray(Object.keys(objectCategoryToProperties))
                    },
                    {
                        type: "input_value", 
                        name: "SENTENCE",
                        check: "Boolean"
                    }
                ],
                output: "Boolean", 
                colour: sentenceConstructorColor
            })
        }
    }
}


export const implication = {
    name: 'Implication',
    category: 'Sentence Constructors',
    block: {
        init: function() {
            this.jsonInit({
                message0: "if %1 then %2",
                args0: [
                    {
                        type: "input_value",
                        name: "ANTECEDENT",
                        check: "Boolean"
                    },
                    {
                        type: "input_value",
                        name: "CONSEQUENT",
                        check: "Boolean"
                    }
                ],
                output: "Boolean",
                colour: sentenceConstructorColor
            })
        }
    }
}


export default class FinalConditionDrawer extends React.Component {
    state = {}

    render() {
        return(
            <BlocklyDrawer
                tools={[
                    basicUnarySentence, 
                    basicBinarySentence,
                    conjunction,
                    disjunction,
                    negation, 
                    universal, 
                    existential,
                    implication,
                ]}
                onChange={(code, workspace) => {
                    console.log(code);
                    // resultCodeObj = code;
                }}
                language={Blockly.Python}
                appearance={
                    {
                        categories: {
                        Demo: {
                            colour: 'basicSentenceColor'
                        }
                        }
                    }
                }
            >
            </BlocklyDrawer>
        )
    }
}

