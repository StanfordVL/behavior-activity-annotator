import React from 'react';
import Blockly from 'node-blockly/browser';
import BlocklyDrawer, { Block, Category } from 'react-blockly-drawer';
import { dropdownGenerators } from './dropdown_generators.js'
import AirTable from 'airtable'
import Button from 'react-bootstrap/Button'


export class objectOptions {
    constructor(selectedObjects) {
        this.selectedObjects = selectedObjects
    }

    getInstancesCategories() {
        let objectInstanceLabels = [['select an object', 'empty']]
        let instanceToCategory = {'empty': 'empty'}
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
        let categoryLabels = [['select a category', 'empty']]
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
      />
      <Button
        onClick={this.onSave}
        variant="outline-dark"
        size="lg"
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
          allLabelsValues: [['select an object', 'empty']],
          currentObjectLabel: 'select an object',
          currentObjectValue: 'empty',
          currentObjectCategory: 'empty'
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
      const object = block.getFieldValue('OBJECT').toLowerCase() || '\'\'';
      const adjective = String(convertName(block.getFieldValue('DESCRIPTOR')).toLowerCase()) || '\'\'';
      const code = `(${adjective} ${object})`;
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
        allLabelsValues: [['select an object', 'empty']],
    //   currentObjectLabel: 'select an object',
    //   currentObjectValue: 'empty',
    //   currentObjectCategory: 'empty'
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
    const object1 = block.getFieldValue('OBJECT1').toLowerCase() || '\'\'';
    const adjective = convertName(block.getFieldValue('DESCRIPTOR').toLowerCase()) || '\'\'';
    const object2 = block.getFieldValue('OBJECT2').toLowerCase() || '\'\'';
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

export const universal = {
    name: 'Universal',
    category: 'Composed Conditions with Categories',
    block: {
        init: function(...args) {
            const block = this;

            const state = {
                allLabelsValues: [['select a category', 'empty']],
                // currentCategoryLabel: 'select a category',
                // currentCategoryValue: 'empty'
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
        const category = block.getFieldValue('CATEGORY').toLowerCase() || '\'\'';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || '0'
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
                allLabelsValues: [['select a category', 'empty']],
                // currentCategoryLabel: 'select a category',
                // currentCategoryValue: 'empty'
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
        const category = block.getFieldValue('CATEGORY').toLowerCase() || '\'\'';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || '0'
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
                allLabelsValues: [['select a category', 'empty']],
                // currentCategoryLabel: 'select a category',
                // currentCategoryValue: 'empty'
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
        const number = block.getFieldValue('NUMBER') || '0';
        const category = block.getFieldValue('CATEGORY').toLowerCase() || '\'\'';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || '0'
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
                allLabelsValues: [['select a category', 'empty']],
                // currentCategoryLabel: 'select a category',
                // currentCategoryValue: 'empty'
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
        const category1 = block.getFieldValue('CATEGORY1').toLowerCase() || '0';
        const category2 = block.getFieldValue('CATEGORY2').toLowerCase() || '\'\'';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || '0'
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
                allLabelsValues: [['select a category', 'empty']],
                // currentCategoryLabel: 'select a category',
                // currentCategoryValue: 'empty'
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
        const category2 = block.getFieldValue('CATEGORY2').toLowerCase() || '\'\'';
        const sentence = Blockly.JavaScript.valueToCode(block, 'SENTENCE', Blockly.JavaScript.ORDER_ADDITION) || 'null'
        const code = `(fornpairs (${number}) (?${category1} - ${category1}) (?${category2} - ${category2}) ${sentence})`
        return [code, Blockly.JavaScript.ORDER_MEMBER]
    }
}