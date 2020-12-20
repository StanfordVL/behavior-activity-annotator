import React from 'react';
import Blockly from 'node-blockly/browser';
import BlocklyDrawer, { Block, Category } from 'react-blockly-drawer';
import { dropdownGenerators } from './dropdown_generators.js'
import AirTable from 'airtable'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'


export class objectOptions {
    constructor(selectedObjects) {
        this.selectedObjects = selectedObjects
    }

    getInstancesCategories() {
        let objectInstanceLabels = [['select an object', 'null']]
        let instanceToCategory = {'null': 'null'}
        for (const [category, number] of Object.entries(this.selectedObjects)) {
            for (let i = 0; i < number; i++) {
                let instanceLabel = category + (i + 1).toString()
                objectInstanceLabels.push([instanceLabel, instanceLabel])    
                instanceToCategory[instanceLabel] = category
                instanceToCategory[category] = category
            }
        }
        let instanceCategoryLabels = objectInstanceLabels.concat(this.getCategories().slice(1))
        return ([instanceCategoryLabels, instanceToCategory])
    }

    getCategories() {
        let categoryLabels = [['select a category', 'null']]
        for (const [category, number] of Object.entries(this.selectedObjects)) {
            if (number !== 0) {
                categoryLabels.push([category, category])
            }
        }
        return (categoryLabels)
    }
}

const blocklyNameToPDDLName = {
    'on top of': 'ontop',
    'next to': 'nextto',
}

/* COLORS */
const sentenceConstructorColor = "#76912F";
const basicSentenceColor = "#D96704";
const rootColor = "#731D45"


function convertName(name) {
    if (name in blocklyNameToPDDLName) {
        return (blocklyNameToPDDLName[name])
    } else {
        return (name)
    }
}


function generateDropdownArray(labels) {
    return(labels.map(label => [label, label.toUpperCase()]))
}


let updatedInitialConditions = '';
let updatedGoalConditions = '';


export class FinalSubmit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            initialReady: true,
            goalReady: true,
            showErrorMessage: false,
            modalText: ""
        }

        // this.genModalText = this.genModalText.bind(this)
    }

    onSubmit(event) {

        if (updatedGoalConditions.includes("null") && updatedInitialConditions.includes("null")) {
            event.preventDefault();
            this.setState({ 
                showErrorMessage: true,
                modalText: "Both the initial and goal conditions have empty field(s). Fix and submit again!"
            })
        } else if (updatedGoalConditions.includes("null")) {
            event.preventDefault();
            this.setState({ 
                showErrorMessage: true,
                modalText: "The initial conditions look good, but the goal conditions have empty field(s). Fix and submit again!"
            })
        } else if (updatedInitialConditions.includes("null")) {
            event.preventDefault();
            this.setState({ 
                showErrorMessage: true, 
                modalText: "The goal conditions look good, but the initial conditions have empty field(s). Fix and submit again!"
            })
        } else {
            console.log('no code has nulls')
            this.setState({ 
                showErrorMessage: false,
                modalText: "" 
            })

            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer keyeaIvUAzmIaj3ma"
                },
                body:JSON.stringify({
                    "records": [{
                        "fields": {
                            "AnnotatorID": "Test",
                            "InitialConditions": updatedInitialConditions,
                            "GoalConditions": updatedGoalConditions,
                            "FinalSave": 1
                        }
                    }]
                })
            }
            fetch('https://api.airtable.com/v0/appIh5qQ5m4UMrcps/Results', requestOptions)
            .then(response => response.json())

            console.log('successfully submitted!')
        }
    }


    onHide() {
        this.setState({ showErrorMessage: false })
    }

    render() {
        return(
            <div>
                <Button 
                    size="lg" 
                    variant="secondary"
                    type="submit"
                    onClick={(event) => this.onSubmit(event)}
                >
                    Final submit 
                </Button>
                <Modal 
                    show={this.state.showErrorMessage}
                    onHide={() => this.onHide()}
                >
                    <Modal.Header closeButton>
                        <Modal.Title as="h5">Incomplete conditions</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.modalText}
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}


export default class ConditionDrawer extends React.Component {
  constructor(props) {
    super(props);
    console.log('PROPS:', props)
    this.onWorkspaceChange = this.onWorkspaceChange.bind(this)
  }

  onWorkspaceChange(code, workspace) {
      console.log('WORKSPACE CHANGE')
      if (this.props.drawerType == "initial") {
          updatedInitialConditions = code;
      } else {
          updatedGoalConditions = code;
      }
      console.log('UPDATED INITIAL CONDITIONS:', updatedInitialConditions)
  }

  onSave() {
    var base = new AirTable({apiKey: 'keyeaIvUAzmIaj3ma'}).base('appIh5qQ5m4UMrcps');
    // console.log('updated init code during save', updatedInitialConditions)

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

  render() {
    console.log('CALLING DRAWER RENDER')
    return (<div>
      <BlocklyDrawer
        tools={[
            basicUnarySentence,
            basicBinarySentence,
            conjunction,
            disjunction,
            negation,
            implication,
            universal,
            existential,
            forN,
            forPairs,
            forNPairs
        ]}
        // onChange={(code, workspace) => {
        //   console.log('CODE:', code);
        // }}
        onChange={this.onWorkspaceChange}
        language={Blockly.JavaScript}
      >
          {/* <Category name="Root">
              <Block type="root_block"/>
          </Category> */}
      </BlocklyDrawer>
      <Button
        onClick={this.onSave}
        variant="outline-dark"
        size="lg"
        style={{ "marginTop": "20px" }}
      >
          Save {this.props.drawerType} state
      </Button>
    </div>
    );
  }
}


export const basicUnarySentence = {
    name: 'BasicUnaryCondition',
    category: 'Basic Conditions',
    block: {
      init: function (...arxs) {
        const block = this;
        
        const state = {
          allLabelsValues: [['select an object', 'null']],
          currentObjectLabel: 'select an object',
          currentObjectValue: 'null',
          currentObjectCategory: 'null'
        };
  
        this.setOnChange(function(changeEvent) {
          let selectedObjectsContainer = new objectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
          let [objectInstanceLabels, instanceToCategory] = selectedObjectsContainer.getInstancesCategories()
          state.allLabelsValues = objectInstanceLabels
  
          const descriptorField = block.getField('DESCRIPTOR');
          const currentObjectValue = block.getFieldValue('OBJECT');
          const currentDescriptorValue = block.getFieldValue('DESCRIPTOR');
  
          descriptorField.setValue(currentObjectValue !== state.currentObjectValue ? '' : currentDescriptorValue);
          state.currentObjectValue = currentObjectValue;
          state.currentObjectCategory = instanceToCategory[currentObjectValue]
  
        });
  
        this.jsonInit({
          message0: '%1 is %2',
          args0: [
            {
              type: 'field_dropdown',
              name: 'OBJECT',
              options: (...args) => {
              //   return objectInstanceLabels
              return state.allLabelsValues;
              },
            },
            {
              type: 'field_dropdown',
              name: 'DESCRIPTOR',
              options: () => {
                return dropdownGenerators[state.currentObjectCategory]();
              },
            }
          ],
          output: 'Boolean',
          colour: basicSentenceColor,
          tooltip: 'Says Hello',
        });
      },
    },
    generator: (block) => {
      let object = block.getFieldValue('OBJECT').toLowerCase() // || 'null';
      object = /\d/.test(object) ? object : "?" + object
      const adjective = String(convertName(block.getFieldValue('DESCRIPTOR')).toLowerCase()) || 'null';
      const code = `(${adjective} ${object})`;
      console.log(code)
      return [code, Blockly.JavaScript.ORDER_MEMBER];
    },
  };


export const basicBinarySentence = {
name: 'BasicBinaryCondition',
category: 'Basic Conditions',
block: {
    init: function (...arxs) {
    const block = this;
    
    const state = {
        allLabelsValues: [['select an object', 'null']],
    };

    this.setOnChange(function(changeEvent) {
        let selectedObjectsContainer = new objectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
        let [objectInstanceLabels, instanceToCategory] = selectedObjectsContainer.getInstancesCategories()
        state.allLabelsValues = objectInstanceLabels
    });

    this.jsonInit({
        message0: '%1 is %2 %3',
        args0: [
        {
            type: 'field_dropdown',
            name: 'OBJECT1',
            options: (...args) => {
            //   return objectInstanceLabels
            return state.allLabelsValues;
            },
        },
        {
            type: 'field_dropdown',
            name: 'DESCRIPTOR',
            options: () => {
            return generateDropdownArray(['on top of', 'inside', 'next to', 'under'])
            },
        },
        {
            type: 'field_dropdown',
            name: 'OBJECT2',
            options: (...args) => {
                return state.allLabelsValues;
            }
        }
        ],
        output: 'Boolean',
        colour: basicSentenceColor,
        tooltip: 'Says Hello',
    });
    },
},
generator: (block) => {
    let object1 = block.getFieldValue('OBJECT1').toLowerCase() || 'null';
    object1 = /\d/.test(object1) ? object1 : "?" + object1
    const adjective = convertName(block.getFieldValue('DESCRIPTOR').toLowerCase()) || 'null';
    let object2 = block.getFieldValue('OBJECT2').toLowerCase() || 'null';
    object2 = /\d/.test(object2) ? object2 : "?" + object2
    const code = `(${adjective} ${object1} ${object2})`;
    return [code, Blockly.JavaScript.ORDER_MEMBER];
},
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
                        check: "Boolean"
                    },
                    {
                        type: 'input_value',
                        name: 'CONJUNCT2',
                        check: "Boolean"
                    }
                ],
                output: "Boolean",
                colour: sentenceConstructorColor,
                tooltip: 'Applies a descriptor to an object',
            });
        }
    },
    generator: (block) => {
        const conjunct1 = Blockly.JavaScript.valueToCode(block, 'CONJUNCT1', Blockly.JavaScript.ORDER_ADDITION) || 'null';
        const conjunct2 = Blockly.JavaScript.valueToCode(block, 'CONJUNCT2', Blockly.JavaScript.ORDER_ADDITION) || 'null';
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
        const disjunct1 = Blockly.JavaScript.valueToCode(block, 'DISJUNCT1', Blockly.JavaScript.ORDER_ADDITION) || 'null';
        const disjunct2 = Blockly.JavaScript.valueToCode(block, 'DISJUNCT2', Blockly.JavaScript.ORDER_ADDITION) || 'null';
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
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || 'null';
        const code = `(not ${sentence})`
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
        const antecedent = Blockly.JavaScript.valueToCode(block, 'ANTECEDENT', Blockly.JavaScript.ORDER_ADDITION) || 'null';
        const consequent = Blockly.JavaScript.valueToCode(block, 'CONSEQUENT', Blockly.JavaScript.ORDER_ADDITION) || 'null';
        const code = `(imply ${antecedent} ${consequent})`
        return [code, Blockly.JavaScript.ORDER_MEMBER];
    } 
}

export const universal = {
    name: 'Universal',
    category: 'Composed Conditions with Categories',
    block: {
        init: function(...args) {
            const block = this;

            const state = {
                allLabelsValues: [['select a category', 'null']],
                // currentCategoryLabel: 'select a category',
                // currentCategoryValue: 'null'
            };

            this.setOnChange(function(changeEvent) {
                let selectedObjectsContainer = new objectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
                let categoriesLabels = selectedObjectsContainer.getCategories()
                state.allLabelsValues = categoriesLabels

                // const categoryField = block.getField('CATEGORY')
                // const 
            });

            this.jsonInit({
                message0: 'for all %1 %2',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'CATEGORY',
                        options: (...args) => {
                            return state.allLabelsValues
                        }
                    },
                    {
                        type: 'input_value',
                        name: 'SENTENCE'
                    }
                ],
                output: "Boolean",
                colour: sentenceConstructorColor
            })
        }
    },
    generator: (block) => {
        const category = block.getFieldValue('CATEGORY').toLowerCase() || 'null';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || 'null'
        const code = `(forall (?${category} - ${category}) ${sentence})`
        return [code, Blockly.JavaScript.ORDER_MEMBER]
    }
}


export const existential = {
    name: 'Existential',
    category: 'Composed Conditions with Categories',
    block: {
        init: function(...args) {
            const block = this;

            const state = {
                allLabelsValues: [['select a category', 'null']],
                // currentCategoryLabel: 'select a category',
                // currentCategoryValue: 'null'
            };

            this.setOnChange(function(changeEvent) {
                let selectedObjectsContainer = new objectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
                let categoriesLabels = selectedObjectsContainer.getCategories()
                state.allLabelsValues = categoriesLabels

                // const categoryField = block.getField('CATEGORY')
                // const 
            });

            this.jsonInit({
                message0: 'there exists some %1 such that %2',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'CATEGORY',
                        options: (...args) => {
                            return state.allLabelsValues
                        }
                    },
                    {
                        type: 'input_value',
                        name: 'SENTENCE'
                    }
                ],
                output: "Boolean",
                colour: sentenceConstructorColor
            })
        }
    },
    generator: (block) => {
        const category = block.getFieldValue('CATEGORY').toLowerCase() || 'null';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || 'null'
        const code = `(exists (?${category} - ${category}) ${sentence})`
        return [code, Blockly.JavaScript.ORDER_MEMBER]
    }
}


export const forN = {
    name: 'ForN',
    category: 'Composed Conditions with Categories',
    block: {
        init: function(...args) {
            const block = this;

            const state = {
                allLabelsValues: [['select a category', 'null']],
                // currentCategoryLabel: 'select a category',
                // currentCategoryValue: 'null'
            };

            this.setOnChange(function(changeEvent) {
                let selectedObjectsContainer = new objectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
                let categoriesLabels = selectedObjectsContainer.getCategories()
                state.allLabelsValues = categoriesLabels

                // const categoryField = block.getField('CATEGORY')
                // const 
            });

            this.jsonInit({
                message0: 'for %1 %2, %3',
                args0: [
                    {
                        type: 'field_number',
                        name: 'NUMBER', 
                        value: 0
                    },
                    {
                        type: 'field_dropdown',
                        name: 'CATEGORY',
                        options: (...args) => {
                            return state.allLabelsValues
                        }
                    },
                    {
                        type: 'input_value',
                        name: 'SENTENCE'
                    }
                ],
                output: "Boolean",
                colour: sentenceConstructorColor
            })
        }
    },
    generator: (block) => {
        const number = block.getFieldValue('NUMBER') || 'null';
        const category = block.getFieldValue('CATEGORY').toLowerCase() || 'null';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || 'null'
        const code = `(forn (${number}) (?${category} - ${category}) ${sentence})`
        return [code, Blockly.JavaScript.ORDER_MEMBER]
    }
}


export const forPairs = {
    name: 'ForPairs',
    category: 'Composed Conditions with Categories',
    block: {
        init: function(...args) {
            const block = this;

            const state = {
                allLabelsValues: [['select a category', 'null']],
                // currentCategoryLabel: 'select a category',
                // currentCategoryValue: 'null'
            };

            this.setOnChange(function(changeEvent) {
                let selectedObjectsContainer = new objectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
                let categoriesLabels = selectedObjectsContainer.getCategories()
                state.allLabelsValues = categoriesLabels

                // const categoryField = block.getField('CATEGORY')
                // const 
            });

            this.jsonInit({
                message0: 'for pairs of %1 and %2, %3',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'CATEGORY1', 
                        options: (...args) => {
                            return state.allLabelsValues
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'CATEGORY2',
                        options: (...args) => {
                            return state.allLabelsValues
                        }
                    },
                    {
                        type: 'input_value',
                        name: 'SENTENCE'
                    }
                ],
                output: "Boolean",
                colour: sentenceConstructorColor
            })
        }
    },
    generator: (block) => {
        const category1 = block.getFieldValue('CATEGORY1').toLowerCase() || 'null';
        const category2 = block.getFieldValue('CATEGORY2').toLowerCase() || 'null';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || 'null'
        const code = `(forpairs (?${category1} - ${category1}) (?${category2} - ${category2}) ${sentence})`
        return [code, Blockly.JavaScript.ORDER_MEMBER]
    }
}


export const forNPairs = {
    name: 'ForNPairs',
    category: 'Composed Conditions with Categories',
    block: {
        init: function(...args) {
            const block = this;

            const state = {
                allLabelsValues: [['select a category', 'null']],
                // currentCategoryLabel: 'select a category',
                // currentCategoryValue: 'null'
            };

            this.setOnChange(function(changeEvent) {
                let selectedObjectsContainer = new objectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
                let categoriesLabels = selectedObjectsContainer.getCategories()
                state.allLabelsValues = categoriesLabels

                // const categoryField = block.getField('CATEGORY')
                // const 
            });

            this.jsonInit({
                message0: 'for %1 pairs of %2 and %3 %4',
                args0: [
                    {
                        type: 'field_number',
                        name: 'NUMBER', 
                        value: 0
                    },
                    {
                        type: 'field_dropdown',
                        name: 'CATEGORY1', 
                        options: (...args) => {
                            return state.allLabelsValues
                        }
                    },
                    {
                        type: 'field_dropdown',
                        name: 'CATEGORY2',
                        options: (...args) => {
                            return state.allLabelsValues
                        }
                    },
                    {
                        type: 'input_value',
                        name: 'SENTENCE'
                    }
                ],
                output: "Boolean",
                colour: sentenceConstructorColor
            })
        }
    },
    generator: (block) => {
        const number = block.getFieldValue('NUMBER') || '0';
        const category1 = block.getFieldValue('CATEGORY1').toLowerCase() || 'null';
        const category2 = block.getFieldValue('CATEGORY2').toLowerCase() || 'null';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || 'null'
        const code = `(fornpairs (${number}) (?${category1} - ${category1}) (?${category2} - ${category2}) ${sentence})`
        return [code, Blockly.JavaScript.ORDER_MEMBER]
    }
}


// Blockly.Blocks['root_block'] = {
//     /**
//      * Block for creating a list with any number of elements of any type.
//      * @this {Blockly.Block}
//      */
//     init: function() {
//     //   this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
//       this.setStyle('list_blocks');
//       this.itemCount_ = 3;
//       this.updateShape_();
//       this.setOutput(true, 'Array');
//       this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
//     //   this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_TOOLTIP']);
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
//             // input.appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
//             input.appendField('toolbox')
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
  
//   Blockly.Blocks['lists_create_with_container'] = {
//     /**
//      * Mutator block for list container.
//      * @this {Blockly.Block}
//      */
//     init: function() {
//       this.setStyle('list_blocks');
//       this.appendDummyInput()
//           .appendField(Blockly.Msg['LISTS_CREATE_WITH_CONTAINER_TITLE_ADD']);
//       this.appendStatementInput('STACK');
//       this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_CONTAINER_TOOLTIP']);
//       this.contextMenu = false;
//     }
//   };
  
//   Blockly.Blocks['lists_create_with_item'] = {
//     /**
//      * Mutator block for adding items.
//      * @this {Blockly.Block}
//      */
//     init: function() {
//       this.setStyle('list_blocks');
//       this.appendDummyInput()
//           .appendField(Blockly.Msg['LISTS_CREATE_WITH_ITEM_TITLE']);
//       this.setPreviousStatement(true);
//       this.setNextStatement(true);
//       this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_ITEM_TOOLTIP']);
//       this.contextMenu = false;
//     }
//   };
  