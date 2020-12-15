import React from 'react'
import Button from 'react-bootstrap/Button'
import Blockly from 'node-blockly/browser';
import BlocklyDrawer, { Block, Category } from 'react-blockly-drawer'
import AirTable from 'airtable'
import flatten from 'flat'
import blockly_compressed_browser from 'node-blockly/lib/blockly_compressed_browser';


/* RELEVANT OBJECTS */
const sceneObjects = require('./pack_lunch_objects.json');
var objectLabelToCategory = {           // TODO get from selection (which is also a TODO)
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


/* COLORS */
const sentenceConstructorColor = "#D39953";
const basicSentenceColor = "#853C41";
const rootColor = "#2A415F"



let updatedInitialConditions = '';
let updatedGoalConditions = '';


export default class ConditionDrawer extends React.Component {
    constructor(props) {
        super(props);

        this.onSave = this.onSave.bind(this)
        this.onWorkspaceChange = this.onWorkspaceChange.bind(this)
    }

    getSelectedObjects() {
        let selectedObjects = this.props.selectedObjects;
        objectLabelToCategory = {}
        for (const [category, number] of Object.entries(selectedObjects)) {
            console.log(category, number)
        }
    }

    onWorkspaceChange(code, workspace) {
        console.log('CODE:', code);
        const domparser = new DOMParser();
        const xml = domparser.parseFromString(workspace, 'text/xml')
        console.log(xml)
        console.log(xml.getElementsByName('OBJECT1'))
        if (this.props.drawerType == "initial") {
            updatedInitialConditions = code;
        } else {
            updatedGoalConditions = code;
        }
    }

    onSave() {
        var base = new AirTable({apiKey: 'keyeaIvUAzmIaj3ma'}).base('appIh5qQ5m4UMrcps');
        console.log('updated init code during save', updatedInitialConditions)

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer keyeaIvUAzmIaj3ma'
            },
            body:JSON.stringify({
                "records": [
                    {
                        "fields": {
                            "AnnotatorID": "Test",
                            "InitialConditions": updatedInitialConditions,
                            "GoalConditions": updatedGoalConditions,
                            "FinalSave": 0
                        }
                    }
                ]
            })
        }
        fetch('https://api.airtable.com/v0/appIh5qQ5m4UMrcps/Results', requestOptions)
        .then(response => response.json())    
        
        console.log('successfully posted to airtable!')
    }

    getBlockTypes(drawerType) {
        if (drawerType === "initial") {
            return ([
                basicUnarySentence,
                basicBinarySentence,
                conjunction,
                disjunction,
                negation,
                implication,
                universal,
                existential
            ])
        } else {        // goal drawer 
            return ([
                basicUnarySentence,
                basicBinarySentence,
                conjunction,
                disjunction,
                negation,
                implication,
                universal,
                existential
            ])
        }
    }

    render() {
        console.log(this.props.selectedObjects)
        return(
            <div>
                <BlocklyDrawer
                    onChange={this.onWorkspaceChange}
                    language={Blockly.JavaScript}
                    appearance={
                        {
                            categories: {
                                Root: {colour: basicSentenceColor}
                            }
                        }
                    }
                    tools={this.getBlockTypes(this.props.drawerType)}
                >
                    <Category name="Root">
                        <Block type="high_level_root"/>
                    </Category>

                </BlocklyDrawer>
                <Button
                    onClick={this.onSave}
                    variant="outline-dark"
                    size="lg"
                >
                    Save {this.props.drawerType} state 
                </Button>
            </div>
        )
    }
}


const blocklyNameToPDDLName = {
    'on top of': 'ontop',
    'next to': 'nextto'
}

function convertName(name) {
    if (name in blocklyNameToPDDLName) {
        return (blocklyNameToPDDLName[name])
    } else {
        return (name)
    }
}


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
        }
    },
    generator: (block) => {
        const object = block.getFieldValue('OBJECT').toLowerCase() || '\'\'';
        const adjective = convertName(block.getFieldValue('DESCRIPTOR').toLowerCase()) || '\'\'';
        const code = `(${adjective} ${object})`;
        return [code, Blockly.JavaScript.ORDER_MEMBER];
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
        }
    },
    generator: (block) => {
        const object1 = block.getFieldValue('OBJECT1').toLowerCase() || '\'\'';
        const adjective = convertName(block.getFieldValue('DESCRIPTOR').toLowerCase()) || '\'\'';
        const object2 = block.getFieldValue('OBJECT2').toLowerCase() || '\'\'';
        const code = `(${adjective} ${object1} ${object2})`;
        return [code, Blockly.JavaScript.ORDER_MEMBER];
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
            });
        }
    },
    generator: (block) => {
        const conjunct1 = Blockly.JavaScript.valueToCode(block, 'CONJUNCT1', Blockly.JavaScript.ORDER_ADDITION) || '0';
        const conjunct2 = Blockly.JavaScript.valueToCode(block, 'CONJUNCT2', Blockly.JavaScript.ORDER_ADDITION) || '0';
        const code = `(and ${conjunct1} ${conjunct2})`
        return [code, Blockly.JavaScript.ORDER_MEMBER];
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
    },
    generator: (block) => {
        const disjunct1 = Blockly.JavaScript.valueToCode(block, 'DISJUNCT1', Blockly.JavaScript.ORDER_ADDITION) || '0';
        const disjunct2 = Blockly.JavaScript.valueToCode(block, 'DISJUNCT2', Blockly.JavaScript.ORDER_ADDITION) || '0';
        const code = `(or ${disjunct1} ${disjunct2})`
        return [code, Blockly.JavaScript.ORDER_MEMBER];
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
                    name: "SENTENCE",
                    check: "Boolean"
                  }
                ],
                output: "Boolean",
                colour: sentenceConstructorColor
            })
        }
    },
    generator: (block) => {
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || '0';
        const code = `(not ${sentence})`
        return [code, Blockly.JavaScript.ORDER_MEMBER];
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
    },
    generator: (block) => {
        const category = block.getFieldValue('CATEGORY').toLowerCase() || '\'\'';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || '0';
        const code = `(forall (?${category} - ${category}) ${sentence})`
        return [code, Blockly.JavaScript.ORDER_MEMBER];
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
    },
    generator: (block) => {
        const category = block.getFieldValue('CATEGORY').toLowerCase() || '\'\'';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || '0';
        const code = `(exists (?${category} - ${category}) ${sentence})`
        return [code, Blockly.JavaScript.ORDER_MEMBER];
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
    },
    generator: (block) => {
        const antecedent = Blockly.JavaScript.valueToCode(block, 'ANTECEDENT', Blockly.JavaScript.ORDER_ADDITION) || '0';
        const consequent = Blockly.JavaScript.valueToCode(block, 'CONSEQUENT', Blockly.JavaScript.ORDER_ADDITION) || '0';
        const code = `(imply ${antecedent} ${consequent})`
        return [code, Blockly.JavaScript.ORDER_MEMBER];
    } 
}

Blockly.Blocks['high_level_root'] = {
    /**
     * Block for creating a list with any number of elements of any type.
     * @this {Blockly.Block}
     */
    init: function() {
    //   this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
      this.setStyle('list_blocks');
      this.setColour(rootColor);
      this.itemCount_ = 3;
      this.updateShape_();
    //   this.setOutput(true, 'Array');
      this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
    //   this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_TOOLTIP']);
    },
    /**
     * Create XML to represent list inputs.
     * @return {!Element} XML storage element.
     * @this {Blockly.Block}
     */
    mutationToDom: function() {
      var container = Blockly.utils.xml.createElement('mutation');
      container.setAttribute('items', this.itemCount_);
      return container;
    },
    /**
     * Parse XML to restore the list inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this {Blockly.Block}
     */
    domToMutation: function(xmlElement) {
      this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
      this.updateShape_();
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this {Blockly.Block}
     */
    decompose: function(workspace) {
      var containerBlock = workspace.newBlock('lists_create_with_container');
      containerBlock.initSvg();
      var connection = containerBlock.getInput('STACK').connection;
      for (var i = 0; i < this.itemCount_; i++) {
        var itemBlock = workspace.newBlock('lists_create_with_item');
        itemBlock.initSvg();
        connection.connect(itemBlock.previousConnection);
        connection = itemBlock.nextConnection;
      }
      return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this {Blockly.Block}
     */
    compose: function(containerBlock) {
      var itemBlock = containerBlock.getInputTargetBlock('STACK');
      // Count number of inputs.
      var connections = [];
      while (itemBlock) {
        connections.push(itemBlock.valueConnection_);
        itemBlock = itemBlock.nextConnection &&
            itemBlock.nextConnection.targetBlock();
      }
      // Disconnect any children that don't belong.
      for (var i = 0; i < this.itemCount_; i++) {
        var connection = this.getInput('ADD' + i).connection.targetConnection;
        if (connection && connections.indexOf(connection) == -1) {
          connection.disconnect();
        }
      }
      this.itemCount_ = connections.length;
      this.updateShape_();
      // Reconnect any child blocks.
      for (var i = 0; i < this.itemCount_; i++) {
        Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
      }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this {Blockly.Block}
     */
    saveConnections: function(containerBlock) {
      var itemBlock = containerBlock.getInputTargetBlock('STACK');
      var i = 0;
      while (itemBlock) {
        var input = this.getInput('ADD' + i);
        itemBlock.valueConnection_ = input && input.connection.targetConnection;
        i++;
        itemBlock = itemBlock.nextConnection &&
            itemBlock.nextConnection.targetBlock();
      }
    },
    /**
     * Modify this block to have the correct number of inputs.
     * @private
     * @this {Blockly.Block}
     */
    updateShape_: function() {
      if (this.itemCount_ && this.getInput('EMPTY')) {
        this.removeInput('EMPTY');
      } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
        this.appendDummyInput('EMPTY')
            .appendField(Blockly.Msg['LISTS_CREATE_EMPTY_TITLE']);
      }
      // Add new inputs.
      for (var i = 0; i < this.itemCount_; i++) {
        if (!this.getInput('ADD' + i)) {
          var input = this.appendValueInput('ADD' + i)
              .setAlign(Blockly.ALIGN_RIGHT);
          if (i == 0) {
            input.appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
          }
        }
      }
      // Remove deleted inputs.
      while (this.getInput('ADD' + i)) {
        this.removeInput('ADD' + i);
        i++;
      }
    }


  };


/* <Category name="Basic Sentences">
    <Block type="basic_unary_sentence"
        onChange={() => console.log('change occurred')}
    />
    <Block type="basic_binary_sentence"/>
    <Block type="test_sentence"/>
</Category>
<Category name="Sentence Constructors">
    <Block type='conjunction'/>
    <Block type='disjunction'/>
    <Block type='implication'/>
    <Block type='negation'/>
    <Block type='universal_quantifier'/>
    <Block type='existential_quantifier'/>
</Category>
<Category name="Values">
    <Block type="math_number"/>
</Category> */

// Blockly.defineBlocksWithJsonArray([
//     // Basic unary sentence 
//     {
//         "type": "basic_unary_sentence",
//         "message0": "%1 is %2",
//         "args0": [
//             {
//                 "type": "field_dropdown",
//                 "name": "OBJECT", 
//                 "options": generateDropdownArray(Object.keys(objectLabelToCategory))
//             },
//             {
//                 "type": "field_dropdown",
//                 "name": "DESCRIPTOR", 
//                 "options": generateDropdownArray(objectCategoryToProperties["apple"])
//             }
//         ],
//         "output": "Boolean",
//         "colour": basicSentenceColor,
//         "tooltip": "Applies a descriptor to an object."
//     },

//     // Basic binary sentence
//     {
//         "type": "basic_binary_sentence",
//         "message0": "%1 is %2 %3",
//         "args0": [
//             {
//                 "type": "field_dropdown",
//                 "name": "OBJECT1",
//                 "options": generateDropdownArray(Object.keys(objectLabelToCategory))
//             },
//             {
//                 "type": "field_dropdown", 
//                 "name": "DESCRIPTOR", 
//                 "options": generateDropdownArray(['on top of', 'inside', 'next to', 'under'])
//             },
//             {
//                 "type": "field_dropdown", 
//                 "name": "OBJECT2", 
//                 "options": generateDropdownArray(Object.keys(objectLabelToCategory))
//             }
//         ],
//         "output": "Boolean",
//         "colour": basicSentenceColor,
//         "tooltip": 'Applies a relationship to two objects'
//     },
//     {
//         "type": "conjunction",
//         "message0": '%1 and %2',
//         "args0": [
//             {
//                 "type": 'input_value',
//                 "name": 'CONJUNCT1',
//             },
//             {
//                 "type": 'input_value',
//                 "name": 'CONJUNCT2',
//             }
//         ],
//         "output": "Boolean",
//         "colour": sentenceConstructorColor,
//         "tooltip": 'Applies a descriptor to an object',
//     },
//     {
//         "type": "disjunction",
//         "message0": '%1 or %2',
//         "args0": [
//             {
//                 "type": 'input_value',
//                 "name": 'DISJUNCT1',
//                 "check": "Boolean"
//             },
//             {
//                 "type": 'input_value',
//                 "name": 'DISJUNCT2',
//                 "check": "Boolean"
//             }
//         ],
//         "output": "Boolean",
//         "colour": sentenceConstructorColor,
//         "tooltip": 'Applies a descriptor to an object',
//     },
//     {
//         "type": "negation",
//         "message0": "not %1",
//         "args0": [
//             {
//             "type": "input_value",
//             "name": "BOOL",
//             "check": "Boolean"
//             }
//         ],
//         "output": "Boolean",
//         "colour": sentenceConstructorColor
//     },
//     {
//         "type": "universal_quantifier",
//         "message0": "for all %1: %2",
//         "args0": [
//             {
//                 "type": "field_dropdown",
//                 "name": "CATEGORY", 
//                 "options": generateDropdownArray(Object.keys(objectCategoryToProperties))
//             },
//             {
//                 "type": "input_value", 
//                 "name": "SENTENCE",
//                 "check": "Boolean"
//             }
//         ],
//         "output": "Boolean",
//         "colour": sentenceConstructorColor
//     },
//     {
//         "type": "existential_quantifier",
//         "message0": "there exists some %1 such that %2",
//         "args0": [
//             {
//                 "type": "field_dropdown",
//                 "name": "CATEGORY", 
//                 "options": generateDropdownArray(Object.keys(objectCategoryToProperties))
//             },
//             {
//                 "type": "input_value", 
//                 "name": "SENTENCE",
//                 "check": "Boolean"
//             }
//         ],
//         "output": "Boolean",
//         "colour": sentenceConstructorColor
//     },
//     {
//         "type": "implication",
//         "message0": "if %1 then %2",
//         "args0": [
//             {
//                 "type": "input_value",
//                 "name": "ANTECEDENT",
//                 "check": "Boolean"
//             },
//             {
//                 "type": "input_value",
//                 "name": "CONSEQUENT", 
//                 "check": "Boolean"
//             }
//         ],
//         "output": "Boolean",
//         "colour": sentenceConstructorColor
//     }
// ])

// Blockly.Blocks['test_sentence'] = {
//     init: function() {
//         this.setColour(basicSentenceColor);
//         this.appendDummyInput()
//             .appendField('')
//             .appendField(
//                 new Blockly.FieldDropdown(
//                     generateDropdownArray(Object.keys(objectLabelToCategory))
//                 ), 'OBJECT');
//         this.appendDummyInput()
//             .appendField('is')
//             .appendField(
//                 new Blockly.FieldDropdown(
//                     generateDropdownArray(objectCategoryToProperties["apple"])
//                 ), 'ADJECTIVE');
//         this.setOutput(true, 'Boolean')
//     }
// }