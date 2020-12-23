import React from 'react';
import Card from 'react-bootstrap/Card';
import SmallObjectSelectionWorkspace from './object_selector_forms';

import SceneObjectTable from './scene_object_table';
import SelectedObjectsList from './selected_objects_list'
import ConditionDrawer, { FinalSubmit } from './blockly_drawers'
import {ConditionWritingInstructions} from './written_instructions'
import RoomForm from './room_selection_form'


export class ObjectSelectionWorkspace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allSelectedObjects: {},
            selectedRooms: {}
        }

    }
    componentDidMount() {
        console.log('OBJECT SELECTION WORKSPACE DID MOUNT')
    }

    updateSelectedObjects(numObjects, objectCategory) {
        console.log('submitted in SceneObjectSetup')
        let updatedSelectedObjects = {...this.state.allSelectedObjects};
        if (objectCategory in updatedSelectedObjects) {
            updatedSelectedObjects[objectCategory] += numObjects
        } else {
            updatedSelectedObjects[objectCategory] = numObjects
        }
        this.setState({ allSelectedObjects: updatedSelectedObjects })
        this.props.onObjectUpdate(updatedSelectedObjects)
    }

    updateSelectedRooms(updatedRooms) {
        this.setState({ selectedRooms: updatedRooms })
        console.log('CHOSEN ROOMS FROM INSTRUCTIONS:', updatedRooms)
        this.props.onRoomUpdate(updatedRooms)
    }

    render() {
        return (
            <div>
                <Card className="marginCard">
                    <Card.Body>
                        <h4>Step 1: Selecting a room and objects</h4>
                        <Card.Text>
                            <p>The below scenes are examples of scenes similar to the one your task will be set up in. As you can see, there are scene objects already present. In this step, you'll first choose a room for your task, then pick which scene objects are <em>relevant</em> for your task - i.e. only the objects you need to actually write your conditions. So for the "cleaning table surface" task, this was just the "table". As in these examples, setting up a realistic home environment will be taken care of.</p>
                            <p>
                                [TODO drag-nav interface of a few igibson scenes]
                            </p>
                            <Card className="marginCard">
                                <Card.Body>
                                    <Card.Title as="h4">Room</Card.Title>
                                    <Card.Text>
                                        <p>Choose the room(s) that your task will occur in. Most of our tasks can be done in one room, so just choose the ones that are absolutely necessary (there are some that need more than one room, such as "locking the house up").</p>
                                    </Card.Text>
                                    <RoomForm onSubmit={(updatedRooms) => this.updateSelectedRooms(updatedRooms)}/>
                                    <Card.Text style={{"fontSize": 13, "marginTop": "10px"}} className="text-muted">
                                        Once you submit, you won't be able to edit your choice. 
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                            <Card className="marginCard">
                                <Card.Body>
                                    {/* <h4>Objects that make up your scene</h4> */}
                                    <Card.Title as="h4">Selecting scene objects</Card.Title>
                                    <p>
                                        First, choose which scene objects are relevant for your initial and goal conditions. Scene objects (listed in the table below) are generally furniture or other background objects you see in a clean home. Don't worry about picking all the furniture and other scene objects you want for the house - as you can see, we've already set up realistic looking scenes. Just tell us which ones you need to do {this.props.params.activityName}. For example, if you need a table to do {this.props.params.activityName} but don't need a sofa, even if you like the idea of having a sofa in the environment for aesthetic reasons, choose the table but not the sofa. 
                                    </p>
                                    <SceneObjectTable onObjectSubmit={(numObjects, objectCategory) => this.updateSelectedObjects(numObjects, objectCategory)}/>
                                    <SelectedObjectsList
                                        onObjectDelete={(numObjects, objectCategory) => this.updateSelectedObjects(numObjects, objectCategory)}
                                        selectedObjects={this.state.allSelectedObjects}
                                    />
                                </Card.Body>
                            </Card>
                            <Card>
                                <Card.Body>
                                    <Card.Title as="h4">Selecting additional objects</Card.Title>
                                    <p>
                                        You also have the following objects available to you. Unlike the scene objects, these aren't automatically present. If you want to use these objects, click a label and add a number.
                                    </p>
                                    <p>
                                        You don't have to use all these objects! Just use the ones you find useful. If there's an object you want but you don't see here, we might have it in our full set of objects. Click "see more objects" to get a hierarchy of all the objects available.
                                    </p>
                                    <p>
                                        <b>Important note:</b> as you can see, these objects follow a hierarchy. You can use any word in your initial and goal conditions. For example, {this.props.params.example_super_cat} is a supercategory of {this.props.params.example_sub_cat1} and {this.props.params.example_sub_cat2}. You can use {this.props.params.example_super_cat}, {this.props.params.example_sub_cat1}, or {this.props.params.example_sub_cat2} in your description. The important thing to remember is that if you say something applies to {this.props.params.example_super_cat}, e.g. "{this.props.params.example_super_cat} is {this.props.params.example_descriptor}", that will apply to <em>every object</em> that is {this.props.params.example_super_cat}, including any object that is {this.props.params.example_sub_cat1} or {this.props.params.example_sub_cat2}.
                                    </p>

                                    <p>Additional objects are objects you will need to define initial and final conditions that are not in the list above. They're generally smaller. Select them from the hierarchy below.</p>
                                    <p><b>Important note:</b> As you can see, these objects follow a hierarchy. You can use any word from the hierarchy in your initial and goal conditions. For example, "meat" is a supercategory of "chicken" and "turkey". "Meat", "chicken", and "turkey" are all fair game for your conditions. The important thing to remember is that if you say something applies to meat, e.g. "meat is cooked", that will apply to <em>every object</em> that is meat, including any object that is chicken or turkey.</p>
                                    <SmallObjectSelectionWorkspace onSubmit={(numObjects, objectCategory) => this.updateSelectedObjects(numObjects, objectCategory)}/>
                                    <SelectedObjectsList
                                        onObjectDelete={(numObjects, objectCategory) => this.updateSelectedObjects(numObjects, objectCategory)}
                                        selectedObjects={this.state.allSelectedObjects}
                                    /> 
                                </Card.Body>
                            </Card>   
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>
        )
    }
}


export class ConditionInstruction extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Card>
                <Card.Body>
                    <h4>How to write conditions</h4>
                    <Card.Text>
                        <ConditionWritingInstructions/>
                    </Card.Text>
                </Card.Body>
            </Card>
        )
    }
}


export class ConditionWorkspace extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return(
            <div>
                <Card>
                    <Card.Body>
                        <Card.Title as="h4">Step 2: Writing Conditions</Card.Title>
                        <ConditionWritingInstructions/>
                    {/* </Card.Body>
                </Card> */}
                        <Card className="marginCard">
                            <Card.Body>
                                <Card.Title>Building initial conditions</Card.Title>
                                <ConditionDrawer drawerType="initial"/>
                            </Card.Body>
                        </Card>
                        <Card className="marginCard">
                            <Card.Body>
                                <Card.Title>Building goal conditions</Card.Title>
                                <ConditionDrawer drawerType="goal"/>
                            </Card.Body>
                        </Card>
                {/* <Demo/> */}
                        <Card className="marginCard">
                            <Card.Body>
                                <Card.Text>
                                    Once you press this, you will be redirected away from this page. Take a minute to check your work and make sure you've said what you want to say! Thanks so much for participating, we really appreciate it :) 
                                </Card.Text>
                                <FinalSubmit/>
                            </Card.Body>
                        </Card>
                    </Card.Body>
                </Card>
            </div>
        )
    }
}



