import React from 'react';
import Blockly from 'node-blockly/browser';
import BlocklyDrawer, { Block, Category } from 'react-blockly-drawer';
import { dropdownGenerators, 
    kinematicDropdownGenerators,
    sentenceConstructorColor,
    basicSentenceColor,
    rootColor } from './constants.js'
import { convertName, 
         createObjectsList, 
         getCategoryFromLabel,
         detectObjectInstances,
         ObjectOptions,
         generateDropdownArray } from "./utils.js"
import AirTable from 'airtable'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { allRooms, 
         sceneSynsets,
         objectInstanceRe, 
         detectObjectInstanceAndCategoryRe,
         getPlacementsRe,
         airtableSaveURL,
         airtableResultURL,
         igibsonSamplerURL } from "./constants.js"
import { stringify } from 'uuid';


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
    }

    checkNulls(conditions)  {
        return conditions.includes("null")
    }

    checkEmptyInitialConditions(initialConditions) {
        /**
         * Reports whether the initialConditions are empty or not 
         * 
         * @param {String} initialConditions - initialConditions being checked for emptiness
         * @returns {Boolean} - true if initialConditions are empty else false 
         */
        return initialConditions.match("\\(:init( )+\\(inroom") !== null
    }

    checkCompletelyUnplacedAdditionalObjects(conditions) {
        /**
         * Reports whether for every object mentioned in the conditions, if it is in any placement condition.
         * Only guaranteed correct for initial conditions that have no categories. 
         * 
         * @param {String} conditions - string conditions being checked for additional objects that are 
         *                              not in any placement condition
         * @returns {Boolean} true if there are additional objects that are not in any placement 
         */
        const detectedObjectInstances = detectObjectInstances(conditions) 
        const rawPlacements = conditions.match(getPlacementsRe())
        if (rawPlacements == null) {
            return true 
        }
        for (const objectInstance of detectedObjectInstances) {
            let objectPlaced = false
            for (const placement of rawPlacements) {
                if (placement.match(objectInstance) != null) {
                    objectPlaced = true
                    break
                }
            }
            if (!objectPlaced) {
                return true
            }
        }
        return false
    }

    checkTransitiveUnplacedAdditionalObjects(conditions) {
        /**
         * Reports whether for every placement in the conditions, if the second object is an additional object, 
         *      then the second object is transitively placed relative to a scene object. 
         * It's also true that the first object has to be an additional object and that if the second object is 
         *      a scene object, then relation is allowed for that scene object, but these should be guaranteed by 
         *      the interface.
         * Only guaranteed correct for initial conditions that have no categories. 
         * 
         * @param {String} conditions - string conditions being checked for additional objects that are unplaced 
         *                              even transitively
         * @returns {Boolean} true if there are unplaced additional objects, else false 
         */
        if (this.checkEmptyInitialConditions(conditions)) {
            console.log("EMPTY")
            return false 
        }
        if (this.checkCompletelyUnplacedAdditionalObjects(conditions)) {
            console.log('COMPLETELy UNPLACED')
            return true 
        }
        const rawPlacements = conditions.match(getPlacementsRe())
        let placements = []
        // drop parentheses
        for (const placement of rawPlacements) {
            const [__, object1, object2] = placement.slice(1, -1).split(" ")
            placements.push([object1, object2])
        }

        let placedPairs = {}
        let leftoverPlacements = []
        let currentNumHangingPlacements 
        let newNumHangingPlacements

        // round 1: for each placement, if second object is a scene object, put the pair in placedPairs. Else, 
        //          put the placement in the new queue 
        while (placements.length > 0) {
            const placement = placements.pop()
            const [object1, object2] = placement
            if (sceneSynsets.includes(getCategoryFromLabel(object2))) {
                placedPairs[object1] = object2
            } else {
                leftoverPlacements.push(placement)
            }
        }
        currentNumHangingPlacements = placements.length
        newNumHangingPlacements = leftoverPlacements.length
        placements = leftoverPlacements
        leftoverPlacements = []

        // round >1: for each placement, if the second object is a key in placedPairs, put the first object as 
        //          a key in placedPairs, mapped to the second object's value. If it is not in placedPairs, 
        //          put the placement in the new queue. 
        while (currentNumHangingPlacements !== newNumHangingPlacements) {
            currentNumHangingPlacements = placements.length
            while (placements.length > 0) {
                const placement = placements.pop()
                const [object1, object2] = placement 
                if (object2 in placedPairs) {
                    placedPairs[object1] = placedPairs[object2]
                } else {
                    leftoverPlacements.push(placement)
                }
            }
            newNumHangingPlacements = leftoverPlacements.length
            placements = leftoverPlacements
            leftoverPlacements = []
        }

        return (newNumHangingPlacements !== 0)
    }


    checkCategoriesExist(conditions) {
        /**
         * Check conditions for presence of categories (i.e. objects that are not instances)
         * 
         * @param {String} conditions - conditions being checked for presence of categories
         * @returns {Boolean} true if categories exist else false 
         */
        
        const objectTerms = conditions.match(detectObjectInstanceAndCategoryRe)
        if (objectTerms != null) {
            for (let objectTerm of objectTerms) {
                if (objectTerm.match(objectInstanceRe) == null) {
                    return true 
                }
            }
        } else {
            return false 
        }
    }

    checkNegatedPlacements(conditions) {
        /**
         * Check conditions for presence of negated placement conditions (binary predicates, 
         * i.e. kinematic predicates)
         * 
         * @param {String} conditions - conditions being checked for negated placements
         * @return {Boolean} true if negated placements exist else false 
         */
        const negatedPlacementsRe = new RegExp(`\\(not ${getPlacementsRe().source}\\)`, "g")
        const negatedPlacements = conditions.match(negatedPlacementsRe)
        return negatedPlacements != null
    }


    onSubmit(event) {

        let currentModalText = ""

        console.log('INITIAL CONDITIONS:', updatedInitialConditions)
        console.log('GOAL CONDITIONS:', updatedGoalConditions)

        // Check for errors 
        if (this.checkNulls(updatedInitialConditions)) {
            currentModalText += "The initial conditions have empty field(s).\n"
        }
        if (this.checkTransitiveUnplacedAdditionalObjects(updatedInitialConditions)) {
            currentModalText += "The initial conditions currently contain objects that have not been placed in relation to a scene object (even indirectly)." 
        }
        if (this.checkNegatedPlacements(updatedInitialConditions)) {
            currentModalText += "The initial conditions contain negated two-object basic conditions. In the initial conditions, you can only negate one-object basic conditions."
        }
        if (this.checkCategoriesExist(updatedInitialConditions)) {
            currentModalText += "The initial conditions currently contain object categories, but only object instances are allowed in initial conditions."
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
                            "ActivityName": JSON.parse(window.sessionStorage.getItem('activityName')),
                            "AnnotatorID": JSON.parse(window.sessionStorage.getItem('annotatorName')),
                            "InitialConditions": updatedInitialConditions,
                            "GoalConditions": updatedGoalConditions,
                            "FinalSave": 1,
                            "Objects": createObjectsList(updatedInitialConditions)
                        }
                    }]
                })
            }
            fetch(airtableResultURL, requestOptions)
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
                    // disabled={!this.props.sampleable}        // TODO change once feasibility checking is implemented
                >
                    Submit
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


export class FeasibilityChecker extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            sampleable: false,
            feedback: "",
            showErrorMessage: false
        }
    }

    processRequestResponse(response) {
        const data = JSON.parse(response.json())
        this.setState({ sampleable: data.success, feedback: data.feedback })
        this.props.onCheck(data.success)
    }

    checkFeasibility() {
        const postConditionsRequest = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"            },
            body: JSON.stringify({
                "initialConditions": updatedInitialConditions,
                "goalConditions": updatedGoalConditions,
                "objectList": createObjectsList(updatedInitialConditions)
            })
        }
        fetch(igibsonSamplerURL, postConditionsRequest)     // TODO change to production URL 
        .then(response => this.processRequestResponse(response))
    }

    onClick() {
        this.checkFeasibility()
        this.setState({ showErrorMessage: !this.state.sampleable })
    }

    onHide() {
        this.setState({ showErrorMessage: false })
    }

    render() {
        return (
            <div>
                <Button
                    size="lg"
                    variant="primary"
                    onClick={() => this.onClick()}
                >
                    Check feasibility 
                </Button>
                <Modal
                    show={this.state.showErrorMessage}
                    onHide={() => this.onHide()}
                >
                    <Modal.Header closeButton>
                        <Modal.Title as="h5">Not sampleable</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.feedback}
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}


export class SubmissionSection extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            sampleable: false        // TODO change once feasibility checking is ready 
        }
    }

    onFeasibilityCheck(sampleable) {
        this.setState({ sampleable: sampleable })
    }

    render() {
        return(
            <div>
                <FeasibilityChecker onCheck={this.onFeasibilityCheck}/>
                <FinalSubmit sampleable={this.state.sampleable}/>
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
        code = code.substring(0, code.length - 2)

        // Remove room labels 
        for (let room of allRooms){
            let roomString = ' (' + room + ')'
            code = code.split(roomString).join("")
        }

        if (this.props.drawerType === "initial") {
            // Add room placement predicates 
            let selectedObjectsContainer = new ObjectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
            const [objectInstanceLabels, instanceToCategory] = selectedObjectsContainer.getInstancesCategories()
            for (let [label, __] of objectInstanceLabels) {
                
                if (label.includes(' (')) {
                    let [pureLabel, room] = label.split(' (')
                    room = room.slice(0, -1).split(' ').join('')
                    code = code + ` (inroom ${pureLabel} ${room})`
                }
                else if (sceneSynsets.includes(instanceToCategory[label]) && !(sceneSynsets.includes(label))) {
                    let room = Object.keys(JSON.parse(window.sessionStorage.getItem('room')))[0]
                    code = code + ` (inroom ${label} ${room})`
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
                            "ActivityName": JSON.parse(window.sessionStorage.getItem('activityName')),
                            "AnnotatorID": JSON.parse(window.sessionStorage.getItem('annotatorName')),
                            "InitialConditions": updatedInitialConditions,
                            "GoalConditions": updatedGoalConditions,
                            "FinalSave": 0
                        }
                    }
                ]
            })
        }
        fetch(airtableSaveURL, requestOptions)
        .then(response => response.json())    
        
        console.log('successfully posted to airtable!')
    }

    getBlockTypes() {
        let tools = [
            basicUnarySentence,
            basicBinarySentence,
            negation,
        ]
        if (this.props.drawerType === "goal") {
            tools = tools.concat([
                implication,
                universal,
                existential, 
                forN,
                forPairs,
                forNPairs
            ])
        }
        return tools
    }
    
    render() {
        if (this.props.drawerType === "goal") {
            return (
                <div>
                    <BlocklyDrawer
                        tools={this.getBlockTypes()}
                        onChange={this.onWorkspaceChange}
                        language={Blockly.JavaScript}
                    >
                        <Category name="Or, And">
                            <Block type="conjunction"/>
                            <Block type="disjunction"/>
                        </Category>
                        <Category name="Toolbox">
                            <Block type="root_block"/>
                        </Category>
                    </BlocklyDrawer>
                    <Button
                        onClick={this.onSave}
                        variant="outline-primary"
                        size="lg"
                        style={{ marginTop: "20px" }}
                    >
                        Save {this.props.drawerType} state
                    </Button>
                </div>
            )
        } else {
            return (
                <div>
                    <BlocklyDrawer
                        tools={this.getBlockTypes()}
                        onChange={this.onWorkspaceChange}
                        language={Blockly.JavaScript}
                    >
                        <Category name="Toolbox">
                            <Block type="root_block"/>
                        </Category>
                    </BlocklyDrawer>
                    <Button
                        onClick={this.onSave}
                        variant="outline-primary"
                        size="lg"
                        style={{ marginTop: "20px" }}
                    >
                        Save {this.props.drawerType} state
                    </Button>
                </div>
            )
        }
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
              return state.allLabelsValues;
              },
            },
            {
              type: 'field_dropdown',
              name: 'DESCRIPTOR',
              options: () => {
                if (state.currentObjectCategory in dropdownGenerators) {
                    return dropdownGenerators[state.currentObjectCategory]()
                } else {
                    return dropdownGenerators["null"]()
                }
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
        additionalLabelsValues: [["select an object", "null"]],
        currentSecondObjectValue: "null",
        currentSecondObjectCategory: "null"
    };

    this.setOnChange(function(changeEvent) {
        let selectedObjectsContainer = new ObjectOptions(JSON.parse(window.sessionStorage.getItem('allSelectedObjects')))
        let [objectInstanceLabels, instanceToCategory] = selectedObjectsContainer.getInstancesCategories()
        state.allLabelsValues = objectInstanceLabels
        state.additionalLabelsValues = [["select an object", "null"]]
        for (const [label, value] of state.allLabelsValues) {
            if (!(sceneSynsets.includes(getCategoryFromLabel(value))) && !(value === "null")) {
                state.additionalLabelsValues.push([label, value])
            }
        }

        const descriptorField = block.getField("DESCRIPTOR")
        const currentSecondObjectValue = block.getFieldValue("OBJECT2")
        const currentDescriptorValue = block.getFieldValue("DESCRIPTOR")

        console.log("NEW SECOND OBJECT VALUE:", currentSecondObjectValue)
        console.log("STATE SECOND OBJECT VALUE:", state.currentSecondObjectValue)

        descriptorField.setValue(currentSecondObjectValue !== state.currentSecondObjectValue ? "" : currentDescriptorValue)
        state.currentSecondObjectValue = currentSecondObjectValue
        state.currentSecondObjectCategory = instanceToCategory[currentSecondObjectValue]
    });

    this.jsonInit({
        message0: '%1 is %2 %3',
        args0: [
        {
            type: 'field_dropdown',
            name: 'OBJECT1',
            options: (...args) => {
                return state.additionalLabelsValues
            },
        },
        {
            type: 'field_dropdown',
            name: 'DESCRIPTOR',
            options: () => {
                if (state.currentSecondObjectCategory in kinematicDropdownGenerators) {
                    return kinematicDropdownGenerators[state.currentSecondObjectCategory]()
                } else {
                    return generateDropdownArray(["select an adjective", 'on top of', 'inside', 'next to', 'under'])
                }
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

Blockly.Blocks['conjunction'] = {
    /**
     * Block for creating a list with any number of elements of any type.
     * @this {Blockly.Block}
     */
    init: function() {
    //   this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
    //   this.setStyle('list_blocks');
      this.setColour(sentenceConstructorColor)
      this.itemCount_ = 3;
      this.updateShape_();
      this.setOutput(true, 'Boolean');
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
            input.appendField('and')
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

  Blockly.JavaScript['conjunction'] = function(block) {
    let code = "(and "
    for ( let i = 0; i < block.inputList.length; i++) {
        code += Blockly.JavaScript.valueToCode(block, block.inputList[i].name, Blockly.JavaScript.ORDER_ADDITION) || 'null'
        if (i < block.inputList.length - 1) {
            code += " "
        }
    }
    code += ")"
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL]
}



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

Blockly.Blocks['disjunction'] = {
    /**
     * Block for creating a list with any number of elements of any type.
     * @this {Blockly.Block}
     */
    init: function() {
    //   this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
    //   this.setStyle('list_blocks');
      this.setColour(sentenceConstructorColor)
      this.itemCount_ = 3;
      this.updateShape_();
      this.setOutput(true, 'Boolean');
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
            input.appendField('or')
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

  Blockly.JavaScript['disjunction'] = function(block) {
    let code = "(or "
    for ( let i = 0; i < block.inputList.length; i++) {
        code += Blockly.JavaScript.valueToCode(block, block.inputList[i].name, Blockly.JavaScript.ORDER_ADDITION) || 'null'
        if (i < block.inputList.length - 1) {
            code += " "
        }
    }
    code += ")"
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL]
}

export const negation = {
    name: 'Negation',
    category: 'Not',
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
    category: 'If/Then',
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
    //   let code = "?ROOT"
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
  