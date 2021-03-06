import React from 'react';
import Blockly from 'node-blockly/browser';
import BlocklyDrawer, { Block, Category } from 'react-blockly-drawer';
import { 
    allRooms,
    sceneSynsets,
    dropdownGenerators, 
    kinematicDropdownGeneratorsInit,
    kinematicDropdownGeneratorsGoal,
    sentenceConstructorColor,
    basicSentenceColor,
    rootColor,
    SavesUrl,
    ResultsUrl,
    SamplingUrl,
    TeardownUrl,
    ServerErrorModal,
    initBinaryPredicatesAdditionalReadable,
    binaryPredicatesReadable
    } from './constants.js'
import { convertName, 
         createObjectsList, 
         getCategoryFromLabel,
         ObjectOptions,
         generateDropdownArray,
        checkNulls,
        checkTransitiveUnplacedAdditionalObjects,
        checkMultipleDirtyFloors,
        addAgentStartLine,
        getReadableFeedback } from "./utils.js"
import AgentStartForm from "./agent_start_selection_form"
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

let updatedInitialConditions = '';
let updatedGoalConditions = '';


export class SubmissionSection extends React.Component {
    constructor(props) {
        super(props)
        this.state = { 
            feasible: false, 
            correct: false,
            agentStartRoom: "stub",
            approved: -1
        }
    }

    onFeasibilityCheck(newFeasible, newApproved) { this.setState({ feasible: newFeasible, approved: newApproved }) }

    onCorrectnessCheck(newCorrect) { this.setState({ correct: newCorrect }) }

    onAgentStartSelection(agentStartRoom) { this.setState({ agentStartRoom: agentStartRoom }) }

    render() {
        return (
            <div>
                <AgentStartForm onAgentStartSelection={agentStartRoom => this.onAgentStartSelection(agentStartRoom)}/>
                <FeasibilityChecker 
                    onFeasibilityCheck={(newFeasible, newApproved) => this.onFeasibilityCheck(newFeasible, newApproved)}
                    onCorrectnessCheck={newCorrect => this.onCorrectnessCheck(newCorrect)}
                    agentStartRoom={this.state.agentStartRoom}
                />
                <FinalSubmit 
                    agentStartRoom={this.state.agentStartRoom} 
                    feasible={this.state.feasible}
                    correct={this.state.correct}
                    approved={this.state.approved}
                />
            </div>
        )
    }
}

export class FeasibilityChecker extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showPendingMessage: false,
            feasible: false,
            feasibilityFeedback: [["untested", "untested", "stub", "stub"]],
            showInfeasibleMessage: false,
            showFeasibleMessage: false,
            correct: false,
            codeCorrectnessFeedback: "",
            showCodeIncorrectMessage: false,
            showPrematureMessage: false,
            showCodeCorrectMessage: false,
            disable: false,
            showServerErrorMessage: false,
            approved: -1
        }
    }

    // Event methods 

    onClick() {
        let [codeCorrect, currentCodeCorrectnessFeedback] = this.checkCorrectness()
        // If incorrect, show the correctness error, say it's infeasible, and end things there 
        if (!codeCorrect) {
            this.setState({ 
                correct: false,
                feasible: false,
                showCodeIncorrectMessage: true, 
                codeCorrectnessFeedback: currentCodeCorrectnessFeedback 
            })
            this.props.onCorrectnessCheck(false)
            this.props.onFeasibilityCheck(false, 0)
        } 
        // If correct, offer to check feasibility 
        else {
            this.setState({
                correct: true,
                showCodeCorrectMessage: true
            })
            this.props.onCorrectnessCheck(true)
        }
    }

    onLaunchFeasibilityCheckClick() {
        // Check if simulators are ready 
        let serverReady = JSON.parse(window.sessionStorage.getItem("serverReady"))
        if (serverReady) {
            // If so, run feasibility check
            this.checkFeasibility()
        } else {
            // If not, show the premature message
            this.setState({ showPrematureMessage: true })
        }
        this.onCodeCorrectHide()
    }

    onNoLaunchFeasibilityCheckClick() { this.onCodeCorrectHide() }

    onPrematureHide() { this.setState({ showPrematureMessage: false }) }

    onInfeasibilityConfirmedHide() { this.setState({ showInfeasibleMessage: false }) }

    onFeasibilityConfirmedHide() { this.setState({ showFeasibleMessage: false })}

    onCodeIncorrectHide() { this.setState({ showCodeIncorrectMessage: false }) }

    onCodeCorrectHide() { this.setState({ showCodeCorrectMessage: false }) }

    checkCorrectness() {
        let codeCorrect = true
        let nullsInInit
        let transitivelyUnplacedAdditionalObjectsExist
        let nullsInGoal
        let multipleDirtyFloorsInit
        let multipleDirtyFloorsGoal

        if (checkNulls(updatedInitialConditions)) {
            nullsInInit = <li>Initial conditions have empty fields.</li>
            codeCorrect = false 
        } else {nullsInInit = <div/>}
        if (checkTransitiveUnplacedAdditionalObjects(updatedInitialConditions)) {
            transitivelyUnplacedAdditionalObjectsExist = <li>Initial conditions currently contain objects that have not been placed in relation to a scene object, even indirectly.</li>
            codeCorrect = false 
        } else {transitivelyUnplacedAdditionalObjectsExist = <div/>}
        if (checkNulls(updatedGoalConditions)) {
            nullsInGoal = <li>Goal conditions have empty fields.</li>
            codeCorrect = false 
        } else {nullsInGoal = <div/>}
        if (checkMultipleDirtyFloors(updatedInitialConditions)) {
            multipleDirtyFloorsInit = <li>There are multiple dusty or stained floors in the initial conditions. We can't currently support this.</li>
        }
        if (checkMultipleDirtyFloors(updatedGoalConditions)) {
            multipleDirtyFloorsGoal = <li>There are multiple dusty or stained floors in the goal conditions. We can't currently support this.</li>
            codeCorrect = false
        }
        const currentCodeCorrectnessFeedback = 
            <div>
                The conditions have the following problems:
                <ul>
                    {nullsInInit}
                    {transitivelyUnplacedAdditionalObjectsExist}
                    {/* {negatedPlacementsInInitial} */}
                    {/* {categoriesInInitial} */}
                    {/* {nextToPresent} */}
                    {nullsInGoal}
                    {multipleDirtyFloorsInit}
                    {multipleDirtyFloorsGoal}
                </ul>
            </div>
        return [codeCorrect, currentCodeCorrectnessFeedback]
    }

    checkFeasibility() {
        // Add agent start lines 
        let agentInitialConditions = addAgentStartLine(this.props.agentStartRoom, updatedInitialConditions)

        // Lock up  
        this.setState({ showPendingMessage: true })

        // Send request 
        const conditionsPostRequest = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "activityName": JSON.parse(window.sessionStorage.getItem('activityName')),
                "initialConditions": agentInitialConditions,
                "goalConditions": updatedGoalConditions,
                "objectList": createObjectsList(agentInitialConditions),
                "scenes_ids": JSON.parse(window.sessionStorage.getItem("scenes_ids"))
            })
        }
        window.sessionStorage.setItem("serverBusy", JSON.stringify(true))
        fetch(SamplingUrl, conditionsPostRequest)     
        .then(response => response.json())
        .then(data => {
            this.setState({
                feasible: data.success,
                approved: 0.5,
                feasibilityFeedback: data.feedback,
                showInfeasibleMessage: !data.success,
                showFeasibleMessage: data.success,
                showPendingMessage: false
            })
            window.sessionStorage.setItem("serverBusy", JSON.stringify(false))
            this.props.onFeasibilityCheck(data.success, 1)
        })
        .catch(response => {
            this.setState({ 
                disable: false,
                feasible: true,     
                showInfeasibleMessage: false,
                showFeasibleMessage: false,
                showPendingMessage: false,
                showServerErrorMessage: true,
                approved: 1
            })
            window.sessionStorage.setItem("serverBusy", JSON.stringify(false))
            this.props.onFeasibilityCheck(true, 0.5)
        })
    }

    onServerErrorMessageHide() { this.setState({ showServerErrorMessage: false }) }

    render() {
        return (
            <div>
                <Button
                    size="lg"
                    variant="primary"
                    onClick={() => this.onClick()}
                    className="marginCard"
                    disabled={this.props.agentStartRoom === "stub"}
                >
                    Check feasibility 
                </Button>

                {/* Simulators ready modal */}
                <Modal
                    show={this.state.showPrematureMessage}
                    onHide={() => this.onPrematureHide()}
                >
                    <Modal.Header closeButton>
                        <Modal.Title as="h5">Feasibility checker is not ready</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        It typically takes 6-8 minutes from the time you entered your activity for the 
                         feasibility checker to load, so try again in a couple minutes. If it's 
                         definitely been longer than ~10 minutes, let the interviewer know. 
                    </Modal.Body>
                </Modal>

                {/* Infeasibility confirmed modal */}
                <Modal
                    show={this.state.showInfeasibleMessage}
                    onHide={() => this.onInfeasibilityConfirmedHide()}
                    size="xl"
                    backdrop="static"
                >
                    <Modal.Header closeButton>
                        <Modal.Title as="h5">Not feasible</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{getReadableFeedback(this.state.feasibilityFeedback)}</Modal.Body>
                </Modal>

                {/* Feasibility confirmed modal */}
                <Modal
                    show={this.state.showFeasibleMessage}
                    onHide={() => this.onFeasibilityConfirmedHide()}
                    backdrop="static"
                >
                    <Modal.Header closeButton>
                        <Modal.Title as="h5">Feasible</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{getReadableFeedback(this.state.feasibilityFeedback)}</Modal.Body>
                </Modal>

                {/* Pending modal */}
                <Modal
                    show={this.state.showPendingMessage}
                    onHide={() => this.onPendingHide()}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header>
                        <Modal.Title as="h5">Feasibility checker is working</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        This message will disappear when the checker is done, and you'll get feedback. 
                        Typically 6-10 minute process. If it takes longer than ~12 minutes, let the interviewer
                        know. 
                    </Modal.Body>
                </Modal>

                {/* Code incorrectness modal */}
                <Modal
                    show={this.state.showCodeIncorrectMessage}
                    onHide={() => this.onCodeIncorrectHide()}
                >
                    <Modal.Header closeButton>
                        <Modal.Title as="h5">Errors in conditions</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.state.codeCorrectnessFeedback}</Modal.Body>
                </Modal>

                {/* Code correctness modal */}
                <Modal
                    show={this.state.showCodeCorrectMessage}
                    onHide={() => this.onCodeCorrectHide()}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header>
                        <Modal.Title as="h5">No errors</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* <Modal.Text> */}
                            Your code is correct at the moment! Would you like to run 
                            the final correctness checks and check feasibility? This is 
                            a 6-12 minute process.
                            <p>
                                If you haven't yet saved, please press "No" and save first, then run the checker.
                            </p>
                        {/* </Modal.Text> */}
                    </Modal.Body>
                    <Modal.Body>
                        <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => this.onNoLaunchFeasibilityCheckClick()}
                            style={{ marginRight: "10px" }}
                        >
                            No
                        </Button>
                        <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => this.onLaunchFeasibilityCheckClick()}
                        >
                            Yes
                        </Button>
                    </Modal.Body>
                </Modal>

                {/* Server error message */}
                <ServerErrorModal 
                    show={this.state.showServerErrorMessage} 
                    onHide={() => this.onServerErrorMessageHide()}
                />
            </div>
        )
    }
}

export class FinalSubmit extends React.Component {
    constructor(props) { super(props) }

    onSubmit() {
        // Add agent start term 
        let agentInitialConditions = addAgentStartLine(this.props.agentStartRoom, updatedInitialConditions)

        // TODO write a request to save the commented information to your database 
        /*
        "ActivityName": JSON.parse(window.sessionStorage.getItem("activityName"))
        "AnnotatorID": JSON.parse(window.sessionStorage.getItem("annotatorName"))
        "InitialConditions": agentInitialConditions
        "GoalConditions": updatedGoalConditions
        "FinalSave": 1
        "Objects": createObjectsList(agentInitialConditions)
        "Approved": this.props.approved
        */
        
        // Teardown environments
        window.sessionStorage.setItem("serverReady", JSON.stringify(false))
        fetch(TeardownUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                "scenes_ids": JSON.parse(window.sessionStorage.getItem("scenes_ids")) 
            })
        })
        .then(response => {
            response.json()
            window.sessionStorage.setItem("scenes_ids", JSON.stringify([]))
        })
    } 

    render() {
        return(
            <div>
                <Button 
                    size="lg" 
                    variant="primary"
                    type="submit"
                    onClick={(event) => this.onSubmit(event)}
                    className="marginCard"
                    disabled={!this.props.feasible || this.props.agentStartRoom === "stub" || !this.props.correct}        
                >
                    Submit
                </Button>
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
    }

    onSave() {
        // TODO write a request to save the commented information to your database 
        /*
        "ActivityName": JSON.parse(window.sessionStorage.getItem("activityName"))
        "AnnotatorID": JSON.parse(window.sessionStorage.getItem("annotatorName"))
        "InitialConditions": agentInitialConditions
        "GoalConditions": updatedGoalConditions
        "FinalSave": 0
        "Objects": createObjectsList(agentInitialConditions)
        */         
    }

    getBlockTypes() {
        let tools = []
        if (this.props.drawerType === "goal") {
            tools = tools.concat([
                basicUnarySentenceGoal,
                basicBinarySentenceGoal,
                implication,
                universal,
                existential, 
                forN,
                forPairs,
                forNPairs
            ])
        } else {
            tools = tools.concat([basicUnarySentenceInit, basicBinarySentenceInit])
        }
        tools.push(negation)
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


export const basicUnarySentenceInit = {
    name: 'BasicUnaryConditionInit',
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
          let [objectInstanceLabels, instanceToCategory] = selectedObjectsContainer.getInstances()
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
      let object = block.getFieldValue('OBJECT').toLowerCase() 
      object = /\d/.test(object) ? object : "?" + object
      const adjective = String(convertName(block.getFieldValue('DESCRIPTOR')).toLowerCase()) || 'null';
      const code = `(${adjective} ${object})`;
      return [code, Blockly.JavaScript.ORDER_MEMBER];
    },
  };


export const basicUnarySentenceGoal = {
    name: 'BasicUnaryConditionGoal',
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
      let object = block.getFieldValue('OBJECT').toLowerCase() 
      object = /\d/.test(object) ? object : "?" + object
      const adjective = String(convertName(block.getFieldValue('DESCRIPTOR')).toLowerCase()) || 'null';
      const code = `(${adjective} ${object})`;
      return [code, Blockly.JavaScript.ORDER_MEMBER];
    },
  };


export const basicBinarySentenceGoal = {
name: 'BasicBinaryConditionGoal',
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
                if (state.currentSecondObjectCategory in kinematicDropdownGeneratorsGoal) {
                    return kinematicDropdownGeneratorsGoal[state.currentSecondObjectCategory]()
                } else {
                    return generateDropdownArray(["select an adjective"].concat(binaryPredicatesReadable))
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

    let object2 = block.getFieldValue('OBJECT2').toLowerCase() || 'null';
    object2 = /\d/.test(object2) ? object2 : "?" + object2

    let adjective = convertName(block.getFieldValue('DESCRIPTOR').toLowerCase()) || 'null';
    adjective = /floor\.n\.01/.test(object2) ? "onfloor" : adjective

    const code = `(${adjective} ${object1} ${object2})`;
    return [code, Blockly.JavaScript.ORDER_MEMBER];
},
};

export const basicBinarySentenceInit = {
    name: "BasicBinaryConditionInit",
    category: "Basic Conditions",
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
            let [objectInstanceLabels, instanceToCategory] = selectedObjectsContainer.getInstances()
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
                    if (state.currentSecondObjectCategory in kinematicDropdownGeneratorsInit) {
                        return kinematicDropdownGeneratorsInit[state.currentSecondObjectCategory]()
                    } else {
                        return generateDropdownArray(["select an adjective"].concat(initBinaryPredicatesAdditionalReadable))
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
            output: 'Boolean2',
            colour: basicSentenceColor,
            tooltip: 'Says Hello',
        });
        },
    },
    generator: (block) => {
        let object1 = block.getFieldValue('OBJECT1').toLowerCase() || 'null';
        object1 = /\d/.test(object1) ? object1 : "?" + object1

        let object2 = block.getFieldValue('OBJECT2').toLowerCase() || 'null';
        object2 = /\d/.test(object2) ? object2 : "?" + object2

        let adjective = convertName(block.getFieldValue('DESCRIPTOR').toLowerCase()) || 'null';
        adjective = /floor\.n\.01/.test(object2) ? "onfloor" : adjective

        const code = `(${adjective} ${object1} ${object2})`;
        return [code, Blockly.JavaScript.ORDER_MEMBER];
    },
}


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
      this.setColour(sentenceConstructorColor)
      this.itemCount_ = 3;
      this.updateShape_();
      this.setOutput(true, 'Boolean');
      this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
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
                    },
                    {
                        type: 'input_value',
                        name: 'DISJUNCT2',
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
      this.setColour(sentenceConstructorColor)
      this.itemCount_ = 3;
      this.updateShape_();
      this.setOutput(true, 'Boolean');
      this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
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
                    },
                    {
                        type: "input_value",
                        name: "CONSEQUENT",
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
      this.setColour(rootColor)
      this.itemCount_ = 3;
      this.updateShape_();
      this.setOutput(true, 'Array');
      this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
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
  
