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
        console.log('SELECTED ROOMS FROM INSTRUCTIONS:', this.state.selectedRooms)
        return (
            <div>
                <Card className="marginCard">
                    <Card.Body>
                        <h4>Step 1: Selecting a room and objects</h4>
                        <Card.Text>
                            <p>The below scenes are examples of scenes similar to the one your task will be set up in. As you can see, there are objects already present in the scene like shelves, sofas, or beds. We call these "scene objects". In this step, you'll first choose a room for your task, then pick which scene objects are <em>relevant</em> for your task - i.e. only the objects you need to actually write your conditions. So for the "cleaning table surface" task, this was just the "table". As in these examples, setting up a realistic home environment will be taken care of.</p>
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
                                    <SceneObjectTable 
                                        selectedRooms={this.state.selectedRooms}
                                        onObjectSubmit={(numObjects, objectCategory) => this.updateSelectedObjects(numObjects, objectCategory)}
                                    />
                                    <SelectedObjectsList
                                        onObjectDelete={(numObjects, objectCategory) => this.updateSelectedObjects(numObjects, objectCategory)}
                                        selectedObjects={this.state.allSelectedObjects}
                                    />
                                </Card.Body>
                            </Card>
                            <Card>
                                <Card.Body>
                                    <Card.Title as="h4">Selecting additional objects</Card.Title>
                                    <p>Additional objects are objects you will need to define initial and goal conditions that are not in the list above. They're generally smaller than scene objects, and they are not automatically present. To add additional objects, look through the hierarchy below, click on the nodes you want and use the form below to add any number to your workspace.</p>
                                    <p>
                                        You don't have to use all these objects! Just use the ones you find useful. If there's an object you want but you don't see here, we might have it in our full set of objects. Click "see more objects" to get a hierarchy of all the objects available.
                                    </p>
                                    <p><b>Important note:</b> As you can see, these objects follow a hierarchy. You can use any word from the hierarchy in your initial and goal conditions. For example, "meat" is a supercategory of "chicken" and "turkey". "Meat", "chicken", and "turkey" are all fair game for your conditions. The important thing to remember is that if you say something applies to meat, e.g. "meat is cooked", that will apply to <em>every object</em> that is meat, including any object that is chicken or turkey.</p>
                                    <p>
                                        <b>Another important note:</b> each object term refers to <em>a single item</em>. These items <em>cannot</em> be put together to make other items. For example, let's say your object hierarchy contains the words "sandwich", "lettuce", "bread", and "cheese". Though it seems natural to build a "sandwich" by putting "lettuce", "cheese", and "bread" together, our system won't be able to tell that the pile of ingredients is a "sandwich". If you ask for a "sandwich", you will get a "sandwich" from the start. If you ask for "lettuce", "cheese" and "bread", you'll get exactly those things. You will be free to put them on top of each other, but that won't have anything to do with a "sandwich" selected from the hierarchy. This applies generally - you can ask for objects or ask for their parts and arrange those parts together, but the important thing is that putting the parts together won't <em>create</em> the overall object.
                                    </p>

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
                                <Card.Text>
                                    <p>
                                        Use this workspace to create your initial conditions. The workspace menu has block representations of the conditions described, as in the examples you saw above. You can put them together to make conditions. 
                                    </p>
                                    <p>
                                        <b>Important note:</b> the Basic Condition blocks will allow you to use both object instances and object categories. You can always use object instances, but it only makes sense to use object categories along with a "Composed Condition with Categories" composer. We won't be able to check if you use a category without such a constructor, so please be careful not to.
                                    </p>
                                </Card.Text>
                                <ConditionDrawer drawerType="initial"/>
                            </Card.Body>
                        </Card>
                        <Card className="marginCard">
                            <Card.Body>
                                <Card.Title>Building goal conditions</Card.Title>
                                <Card.Text>Use this workspace to create your goal conditions. The same instructions apply as with initial conditions.</Card.Text>
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



