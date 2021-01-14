import React from 'react';
import Blockly from 'node-blockly/browser';
import BlocklyDrawer, { Block, Category } from 'react-blockly-drawer';
import { dropdownGenerators } from './dropdown_generators.js'
import AirTable from 'airtable'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

const staticEntities = require('./scene_objects.json')
const sceneObjects = staticEntities.sceneObjects
const roomsList = staticEntities.rooms


export class ObjectOptions {
    constructor(selectedObjects) {
        this.selectedObjects = selectedObjects
    }

    createDemotedRoomsMap() {
        let demotedRoomsMap = {}

        for (let [category, number] of Object.entries(this.selectedObjects)) {
            if (category.includes(' (')) {
                let [pureLabel, room] = category.split(' (')
                room = ' (' + room
                if (!(pureLabel in demotedRoomsMap)) {
                    demotedRoomsMap[pureLabel] = {}
                }
                demotedRoomsMap[pureLabel][room] = number
            } else {
                demotedRoomsMap[category] = number
            }
        }
        return demotedRoomsMap
    }

    getRoomIndices(demotedRoomsMap, pureLabel) {
        let startIndex = 0
        let roomsToIndices = {}
        for (let room of Object.keys(demotedRoomsMap[pureLabel]).sort()) {
            roomsToIndices[room] = Array.from({ length: demotedRoomsMap[pureLabel][room]}, (_, i) => i + startIndex)
            startIndex += demotedRoomsMap[pureLabel][room]
        }
        return roomsToIndices 
    }

    getInstancesCategories() {
        const demotedRoomsMap = this.createDemotedRoomsMap()
        let objectInstanceLabels = [['select an object', 'null']]
        let instanceToCategory = {'null': 'null'}

        for (const [pureLabel, value] of Object.entries(demotedRoomsMap)) {
            if (typeof value !== "number") {

                // Create indices for each room that don't overlap, going in alphabetical order of rooms
                const roomsToIndices = this.getRoomIndices(demotedRoomsMap, pureLabel)
                for (const room of Object.keys(roomsToIndices).sort()) {
                    const instanceIndices = roomsToIndices[room]
                    
                    for (let instanceIndex of instanceIndices) {
                        let instanceLabel = pureLabel + (instanceIndex + 1).toString() + room
                        objectInstanceLabels.push([instanceLabel, instanceLabel])
                        instanceToCategory[instanceLabel] = pureLabel
                        instanceToCategory[pureLabel] = pureLabel
                    }
                }

            } else {
                for (let instanceIndex = 0; instanceIndex < value; instanceIndex++) {
                    let instanceLabel = pureLabel + (instanceIndex + 1).toString()
                    objectInstanceLabels.push([instanceLabel, instanceLabel])
                    instanceToCategory[instanceLabel] = pureLabel
                    instanceToCategory[pureLabel] = pureLabel
                }
            }
        }
        let instanceCategoryLabels = objectInstanceLabels.concat(this.getCategories().slice(1))
        return ([instanceCategoryLabels, instanceToCategory])
    }

    getCategories() {
        const demotedRoomsMap = this.createDemotedRoomsMap()
        let categoryLabels = [['select a category', 'null']]
        for (const [pureLabel, value] of Object.entries(demotedRoomsMap)) {
            if (typeof value !== "number") {
                for (const room of Object.keys(value)) {
                    if (demotedRoomsMap[pureLabel][room] > 0) {
                        categoryLabels.push([ pureLabel, pureLabel ])
                        break
                    }
                }
            } else {
                if (value > 0) {
                    categoryLabels.push([ pureLabel, pureLabel ])
                }
            }
        }
        return categoryLabels
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

    checkNulls(conditions)  {
        return conditions.includes("null")
    }

    checkUnplacedAdditionalObjects(conditions) {
        let options = new ObjectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
        let [__, instanceToCategory] = options.getInstancesCategories()

        let allObjects = Object.keys(instanceToCategory)
        // for (let objectInstance in allObjects) {
        console.log('ALL OBJECTS:', allObjects)
        for (let i = 0; i < allObjects.length; i++) {
            let objectInstance = allObjects[i]
            let objectCategory = instanceToCategory[objectInstance]
            
            // if the object is an additional object, is mentioned, and is an instance rather than a category...
            let isAdditionalObject = !(sceneObjects.includes(objectCategory))
            let isMentioned = conditions.includes(objectInstance)
            let isInstance = objectInstance !== objectCategory          // works despite parenthetical rooms because rooms only apply to sceneObjects, which are already excluded. So this is buggy, but it's relying on that detail. 

            let isPlaced = false 
            // Get all placements 
            console.log('OBJECT INSTANCE:', objectInstance)
            const placementMatchString = `\\((ontop|nextto|inside|under) (${objectInstance} \\??[a-z0-9]*|\\??[a-z0-9]* ${objectInstance})\\)`
            const placementRegex = new RegExp(placementMatchString, 'g')
            const placements = conditions.match(placementRegex)
            console.log(placements)
            if (!(placements === null)) {                
                // For each placement, get both objects and check if either of them is a scene object
                for (let placement of placements) {
                    console.log('CURRENT PLACEMENT:', placement)
                    // let potentialSceneObject = placement.split(' ').pop()
                    let potentialSceneObjects = placement.split(' ').slice(1, 3)
                    console.log('POTENTIAL SCENE OBJECTS:', potentialSceneObjects)
                    for (let potentialSceneObject of potentialSceneObjects) {
                        console.log('CURRENT POTENTIAL SCENE OBJ:', potentialSceneObject)
                        potentialSceneObject = potentialSceneObject.split(/\d/)[0]
                        if (potentialSceneObject[0] === '?') {
                            potentialSceneObject = potentialSceneObject.slice(1)
                        }
                        // if one of them is a scene object, say this additional object is placed and break out of this placement
                        console.log('EDITED POTENTIAL SCENE OBJ:', potentialSceneObject)
                        if (sceneObjects.includes(potentialSceneObject)) {
                            console.log('IT IS A SCENE OBJECT')
                            isPlaced = true 
                            break
                        } else {console.log('IT ISNT A SCENE OBJECT' )}
                    }
                    // if the additional object has been shown to be placed, break out of testing placements
                    if (isPlaced) { break }
                }
            }

            // ...return true 
            if (isAdditionalObject && isMentioned && isInstance && !isPlaced) {
                return true 
            }
        }
        return false  
    }


    onSubmit(event) {

        let currentModalText = ""

        console.log('INITIAL CONDITIONS:', updatedInitialConditions)
        console.log('GOAL CONDITIONS:', updatedGoalConditions)

        // Check for errors 
        if (this.checkNulls(updatedInitialConditions)) {
            currentModalText += "The initial conditions have empty field(s).\n"
        }
        if (this.checkUnplacedAdditionalObjects(updatedInitialConditions))  {
            currentModalText += "The initial conditions have additional objects that have not been placed in relation to a scene object (on top of, next to, under, or inside). These aren't required for goal conditions, but they are for initial conditions.\n"
        }
        if (this.checkNulls(updatedGoalConditions)) {
            currentModalText += "The goal conditions have empty field(s).\n"
        }

        if (currentModalText !== "") {
            event.preventDefault()
            this.setState({
                showErrorMessage: true,
                modalText: currentModalText 
            })
        } else {
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
                            "ActivityName": "pack_lunch",
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
                    variant="primary"
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
        this.onWorkspaceChange = this.onWorkspaceChange.bind(this)
    }

    onWorkspaceChange(code, workspace) {
        console.log('WORKSPACE CHANGE')
        code = code.substring(0, code.length - 2)

        // Remove room labels 
        for (let room of roomsList){
            let roomString = ' (' + room + ')'
            code = code.split(roomString).join("")
        }

        if (this.props.drawerType == "initial") {
            // Add room placement predicates 
            let selectedObjectsContainer = new ObjectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
            const [objectInstanceLabels, instanceToCategory] = selectedObjectsContainer.getInstancesCategories()
            for (let [label, __] of objectInstanceLabels) {
                if (label.includes(' (')) {
                    let [pureLabel, room] = label.split(' (')
                    room = room.slice(0, -1).split(' ').join('')
                    code = code + ` (inroom ${pureLabel} ${room})`
                }
            }

            // Add wrapper modifications to code
            code = `(:init ${code})`

            // Update code 
            updatedInitialConditions = code;

        } else {
            // Add modifications to code 

            // Put in question marks for all terms for goal conditions; NOTE this code relies 
            //    1. Spaces only between clauses terms, not between parentheses
            //    2. All quantified categories already have "?" parameter tags 
            let newCode = "" 
            let lastBreak = code.length 
            var i;
            for (i = code.length - 2; i >= 1; i--) {      // don't check very first or very last chars 
                let current  = code[i]
                let successor = code[i + 1]
                let predecessor = code[i - 1]

                if (current === ' ') {                                     // if we get to a space...
                    if (successor !== '?' && successor !== '(' && successor !== '-') {       // ...and the next char isn't a question mark (i.e. already tagged as param) or an open paren (i.e. starting a new clause) or a hyphen for categorization...
                        if (predecessor !== '-') {                      // ...and the previous character isn't a dash (i.e. the keyword in question isn't a category for quantified categorization)...
                            newCode = ' ?' + code.slice(i + 1, lastBreak) + newCode                                              // ...then insert a question mark
                            lastBreak = i
                        }
                    }
                }
            }
            newCode = code.slice(i, lastBreak) + newCode
            newCode = `(:goal (and ${newCode}))`

            // Update code 
            updatedGoalConditions = newCode;
        }        
        
        console.log('CODE:', code)
  }

  onSave() {
    var base = new AirTable({apiKey: 'keyeaIvUAzmIaj3ma'}).base('appIh5qQ5m4UMrcps');

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
                        "ActivityName": "pack_lunch",
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
        onChange={this.onWorkspaceChange}
        language={Blockly.JavaScript}
      >
          <Category name="Root">
              <Block type="root_block"/>
          </Category>
      </BlocklyDrawer>
      <Button
        onClick={this.onSave}
        variant="outline-primary"
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
          let selectedObjectsContainer = new ObjectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
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
        let selectedObjectsContainer = new ObjectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
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
    category: 'Composed Conditions',
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
    category: 'Composed Conditions',
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
    category: 'Composed Conditions',
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
    category: 'Composed Conditions',
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
            };

            this.setOnChange(function(changeEvent) {
                let selectedObjectsContainer = new ObjectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
                let categoriesLabels = selectedObjectsContainer.getCategories()
                state.allLabelsValues = categoriesLabels
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
            };

            this.setOnChange(function(changeEvent) {
                let selectedObjectsContainer = new ObjectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
                let categoriesLabels = selectedObjectsContainer.getCategories()
                state.allLabelsValues = categoriesLabels
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
            };

            this.setOnChange(function(changeEvent) {
                let selectedObjectsContainer = new ObjectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
                let categoriesLabels = selectedObjectsContainer.getCategories()
                state.allLabelsValues = categoriesLabels
            });

            this.jsonInit({
                message0: 'for %1 %2 %3',
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
            };

            this.setOnChange(function(changeEvent) {
                let selectedObjectsContainer = new ObjectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
                let categoriesLabels = selectedObjectsContainer.getCategories()
                state.allLabelsValues = categoriesLabels
            });

            this.jsonInit({
                message0: 'for pairs of %1 and %2 %3',
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
            };

            this.setOnChange(function(changeEvent) {
                let selectedObjectsContainer = new ObjectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
                let categoriesLabels = selectedObjectsContainer.getCategories()
                state.allLabelsValues = categoriesLabels 
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

 
Blockly.Blocks['root_block'] = {
    /**
     * Block for creating a list with any number of elements of any type.
     * @this {Blockly.Block}
     */
    init: function() {
    //   this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
    //   this.setStyle('list_blocks');
      this.setColour(rootColor)
      this.itemCount_ = 3;
      this.updateShape_();
      this.setOutput(true, 'Array');
    //   this.setOutput(false, 'String')
    // this.setPreviousStatement(true)
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
            // input.appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
            input.appendField('toolbox')
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


  Blockly.JavaScript['root_block'] = function(block) {
      console.log(block)
      let code = ""
      for ( let i = 0; i < block.inputList.length; i++) {
          code += Blockly.JavaScript.valueToCode(block, block.inputList[i].name, Blockly.JavaScript.ORDER_ADDITION) || 'null'
          if (i < block.inputList.length - 1) {
              code += " "
          }
      }
      return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL]
  }

  
  Blockly.Blocks['lists_create_with_container'] = {
    /**
     * Mutator block for list container.
     * @this {Blockly.Block}
     */
    init: function() {
      this.setStyle('list_blocks');
      this.appendDummyInput()
          .appendField(Blockly.Msg['LISTS_CREATE_WITH_CONTAINER_TITLE_ADD']);
      this.appendStatementInput('STACK');
      this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_CONTAINER_TOOLTIP']);
      this.contextMenu = false;
    }
  };
  
  Blockly.Blocks['lists_create_with_item'] = {
    /**
     * Mutator block for adding items.
     * @this {Blockly.Block}
     */
    init: function() {
      this.setStyle('list_blocks');
      this.appendDummyInput()
          .appendField(Blockly.Msg['LISTS_CREATE_WITH_ITEM_TITLE']);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_ITEM_TOOLTIP']);
      this.contextMenu = false;
    }
  };
  