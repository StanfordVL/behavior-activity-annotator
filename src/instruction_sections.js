import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button'
import SmallObjectSelectionWorkspace from './object_selector_forms';

import SceneObjectTable from './scene_object_table';
import SelectedObjectsList from './selected_objects_list'
import ConditionDrawer, { FinalSubmit, SubmissionSection } from './blockly_drawers'
import {ConditionWritingInstructions} from './written_instructions'
import RoomForm from './room_selection_form'


export class ObjectSelectionWorkspace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allSelectedObjects: {},
            selectedRooms: {},
            selectRoomHidden: true,
            roomFormSubmitted: false,
            selectSceneObjectsHidden: true,
            selectAdditionalObjectsHidden: true,
            writingConditionsHidden: true
        }

        this.onSeeSelectRoom = this.onSeeSelectRoom.bind(this)
        this.onSeeSelectSceneObjects = this.onSeeSelectSceneObjects.bind(this)
        this.onSeeSelectAdditionalObjects = this.onSeeSelectAdditionalObjects.bind(this)
        this.onSeeConditionWorkspace = this.onSeeConditionWorkspace.bind(this)
    }

    componentDidMount() {
    }

    updateSelectedObjectsIncrement(numObjects, objectCategory) {
        let updatedSelectedObjects = {...this.state.allSelectedObjects};
        if (objectCategory in updatedSelectedObjects) {
            // updatedSelectedObjects[objectCategory] += numObjects
            updatedSelectedObjects[objectCategory] = Math.max(updatedSelectedObjects[objectCategory] + numObjects, 0)
        } else {
            updatedSelectedObjects[objectCategory] = Math.max(numObjects, 0)
        }
        this.setState({ allSelectedObjects: updatedSelectedObjects })
        this.props.onObjectUpdate(updatedSelectedObjects)
    }

    updateSelectedObjectsOverwrite(numObjects, objectCategory) {
        let updatedSelectedObjects = {...this.state.allSelectedObjects}
        updatedSelectedObjects[objectCategory] = Math.max(numObjects, 0)
        this.setState({ allSelectedObjects: updatedSelectedObjects })
        this.props.onObjectUpdate(updatedSelectedObjects)
    }

    updateSelectedRooms(updatedRooms) {
        this.setState({ selectedRooms: updatedRooms })
        this.props.onRoomUpdate(updatedRooms)
    }

    // Shower functions 

    onSeeSelectRoom() {
        this.setState({ selectRoomHidden: false })
    }

    onRoomFormSubmit() {
        this.setState({ roomFormSubmitted: true })
    }

    onSeeSelectSceneObjects() {
        this.setState({ selectSceneObjectsHidden: false})
    }

    onSeeSelectAdditionalObjects() {
        this.setState({ selectAdditionalObjectsHidden: false })
    }

    onSeeConditionWorkspace() {
        this.props.onSeeConditionWorkspace()
        this.setState({ writingConditionsHidden: false })
    }

    render() {
        return (
            <div>
                <Card className="marginCard" hidden={this.props.hidden}>
                    <Card.Body>
                        <h4>Step 1: Selecting a room and objects</h4>
                        <Card.Text>                            
                            <Button 
                                className="marginCard"
                                variant="outline-primary"
                                onClick={this.onSeeSelectRoom}
                                disabled={!this.state.selectRoomHidden}
                            >
                                Select a room
                            </Button>

                            <Card className="marginCard" hidden={this.state.selectRoomHidden}>
                                <Card.Body>
                                    <Card.Title as="h4">Select a room</Card.Title>
                                    <Card.Text>
                                        <p>Choose the room(s) that your task will occur in. Most of our tasks can be done in one room, so just choose the ones that are absolutely necessary (there are some that need more than one room, such as "locking the house up").</p>
                                    </Card.Text>
                                    <Card.Text style={{ marginTop: "30px" }}>
                                        <b>An example simulation environment scene.</b> This might not be the one you get, but anything you get will be similar. When you pick scene objects, make sure not to pick configurations of scene objects that would be hard to satisfy in a scene like this one!
                                    </Card.Text>
                                    <Card.Text style={{ fontSize: 13}} className="text-muted">
                                        Drag to pivot, press control and drag to move around, scroll to zoom.
                                    </Card.Text>
                                    {/* <div className="marginCard" dangerouslySetInnerHTML={
                                        { __html: "<iframe margin='20px' width='600px' height='400px' src='http://104.236.172.175:3000/' />"}
                                    } /> */}
                                    
                                    <RoomForm 
                                        onSubmit={(updatedRooms) => {this.updateSelectedRooms(updatedRooms); this.onRoomFormSubmit()}}
                                        activityName={this.props.activityName}
                                    />
                                    <Card.Text style={{"fontSize": 13, "marginTop": "10px"}} className="text-muted">
                                        Once you submit, you won't be able to edit your choice. 
                                    </Card.Text>

                                    <Button
                                        variant="outline-primary"
                                        onClick={this.onSeeSelectSceneObjects}
                                        disabled={(!this.state.selectSceneObjectsHidden) || (!this.state.roomFormSubmitted)}
                                    >
                                        Select scene objects 
                                    </Button>
                                </Card.Body>
                            </Card>
                            <Card className="marginCard" hidden={this.state.selectSceneObjectsHidden}>
                                <Card.Body>
                                    {/* <h4>Objects that make up your scene</h4> */}
                                    <Card.Title as="h4">Select scene objects</Card.Title>
                                    <p>
                                        First, choose which scene objects are relevant for your initial and goal conditions. Scene objects (listed in the table below) are generally furniture or other background objects you see in a clean home. Don't worry about picking all the furniture and other scene objects you want for the house - as you can see, we've already set up realistic looking scenes. Just tell us which ones you need to do {this.props.params.activityName}. For example, if you need a table to do {this.props.params.activityName} but don't need a sofa, even if you like the idea of having a sofa in the environment for aesthetic reasons, choose the table but not the sofa. 
                                    </p>
                                    {/* <SceneObjectTable 
                                        selectedRooms={this.state.selectedRooms}
                                        onObjectSubmit={(numObjects, objectCategory) => this.updateSelectedObjectsIncrement(numObjects, objectCategory)}
                                        room={this.state.selectedRooms}
                                    /> */}
                                    {Object.keys(this.state.selectedRooms).map((roomType, i) => (
                                        <div>
                                            <SceneObjectTable
                                                selectedRooms={this.state.selectedRooms}
                                                onObjectSubmit={(numObjects, objectCategory) => this.updateSelectedObjectsOverwrite(numObjects, objectCategory)}
                                                room={roomType}
                                                activityName={this.props.activityName}
                                                key={i}
                                            />
                                        </div>
                                    ))}
                                    <SelectedObjectsList
                                        onObjectDelete={(numObjects, objectCategory) => this.updateSelectedObjectsIncrement(numObjects, objectCategory)}
                                        selectedObjects={this.state.allSelectedObjects}
                                    />

                                    <Button
                                        variant="outline-primary"
                                        onClick={this.onSeeSelectAdditionalObjects}
                                        disabled={!this.state.selectAdditionalObjectsHidden}
                                        style={{ marginTop: "20px" }}
                                    >
                                        Select additional objects
                                    </Button>
                                </Card.Body>
                            </Card>
                            <Card hidden={this.state.selectAdditionalObjectsHidden}>
                                <Card.Body>
                                    <Card.Title as="h4">Select additional objects</Card.Title>
                                    <p>Additional objects are objects you will need to define initial and goal conditions that are not in the list above. They're generally smaller than scene objects, and they are not automatically present. To add additional objects, look through the hierarchy below, click on the nodes you want and use the form below to add any number to your workspace.</p>
                                    <p>
                                        You don't have to use all these objects! Just use the ones you find useful. If there's an object you want but you don't see here, we might have it in our full set of objects. Click "see more objects" to get a hierarchy of all the objects available.
                                    </p>
                                    <p><b>Important note:</b> As you can see, these objects follow a hierarchy. You can use any word from the hierarchy in your initial and goal conditions. For example, "meat" is a supercategory of "chicken" and "turkey". "Meat", "chicken", and "turkey" are all fair game for your conditions. The important thing to remember is that if you say something applies to meat, e.g. "meat is cooked", that will apply to <em>every object</em> that is meat, including any object that is chicken or turkey.</p>
                                    <p>
                                        <b>Another important note:</b> each object term refers to <em>a single item</em>. These items <em>cannot</em> be put together to make other items. For example, let's say your object hierarchy contains the words "sandwich", "lettuce", "bread", and "cheese". Though it seems natural to build a "sandwich" by putting "lettuce", "cheese", and "bread" together, our system won't be able to tell that the pile of ingredients is a "sandwich". If you ask for a "sandwich", you will get a "sandwich" from the start. If you ask for "lettuce", "cheese" and "bread", you'll get exactly those things. You will be free to put them on top of each other, but that won't have anything to do with a "sandwich" selected from the hierarchy. This applies generally - you can ask for objects or ask for their parts and arrange those parts together, but the important thing is that putting the parts together won't <em>create</em> the overall object.
                                    </p>

                                    <SmallObjectSelectionWorkspace 
                                        onSubmit={(numObjects, objectCategory) => this.updateSelectedObjectsIncrement(numObjects, objectCategory)}
                                        activityName={this.props.activityName}
                                    />
                                    <SelectedObjectsList
                                        onObjectDelete={(numObjects, objectCategory) => this.updateSelectedObjectsIncrement(numObjects, objectCategory)}
                                        selectedObjects={this.state.allSelectedObjects}
                                    /> 

                                    <Button
                                        variant="outline-primary"
                                        onClick={this.onSeeConditionWorkspace}
                                        disabled={!this.state.writingConditionsHidden} 
                                        style={{ marginTop: "20px" }}
                                    >
                                        Learn about conditions 
                                    </Button>
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

        this.state = {
            conditionDrawersHidden: true 
        }

        this.onSeeConditionDrawers = this.onSeeConditionDrawers.bind(this)
    }

    onSeeConditionDrawers() { 
        this.setState({ conditionDrawersHidden: false })
    }

    render() {
        return(
            <div>
                <Card hidden={this.props.hidden}>
                    <Card.Body>
                        <Card.Title as="h4">Step 2: Writing Conditions</Card.Title>
                        <ConditionWritingInstructions onSeeConditionDrawers={this.onSeeConditionDrawers} />
                    {/* </Card.Body>
                </Card> */}
                        {/* <SelectedObjectsList
                            onObjectDelete={(numObjects, objectCategory) => this.updateSelectedObjectsIncrement(numObjects, objectCategory)}
                            selectedObjects={JSON.parse(window.sessionStorage.getItem('allSelectedObjects'))}
                        />  */}
                        <Card className="marginCard" hidden={this.state.conditionDrawersHidden}>
                            <Card.Body>
                                <Card.Title>Building initial conditions</Card.Title>
                                <Card.Text>
                                    <p>
                                        Use this workspace to create your initial conditions. The workspace menu has block representations of the conditions described, as in the examples you saw above. You can put them together to make conditions. 
                                    </p>
                                    <p>
                                        The scene objects have specific locations within a room, but the additional objects could be anywhere, including on the floor of the room, on top of a lampshade, or other odd locations. Make sure that your initial conditions give every additional object a location by specifying which scene object it should be inside, on top of, next to, or under, as you saw in the "clean a table surface" example. You won't be able to submit unless all the additional objects you use are in a two-object basic condition with a scene object.
                                    </p>
                                    <p>
                                        This also means that for additional objects, they'll only be in your finished activity if you explicitly include them in your initial conditions - otherwise, they wouldn't have a clear location. On the other hand, all the scene objects in your list will be there no matter what. The color-coding in your selected objects list (red for scene objects, green for additional objects) should help with these nuances.  
                                    </p>
                                    <p>
                                        <b>Format:</b> use ONE "toolbox" block in the "Toolbox" tab as your base block. All your conditions will plug into this base block. The blue gear button on the toolbox block will allow you to change the number of entries to take exactly the number of conditions. Make sure you do not have any empty spaces in the toolbox when you are done, or you won't be able to submit. Then, make condition blocks and plug them into the toolbox.
                                    </p>
                                    <p style={{ fontWeight: "bold", color: "red" }}>
                                        NOTE: First, if the space below doesn't have a gray tab with "basic conditions" etc., try resizing your browser window (you can resize it back to full afterward). Second, if you add or delete objects above after making condition blocks, click outside of the blocks to make sure they update to show your new choices.
                                    </p>
                                </Card.Text>
                                <ConditionDrawer drawerType="initial"/>
                            </Card.Body>
                        </Card>
                        <Card className="marginCard" hidden={this.state.conditionDrawersHidden}>
                            <Card.Body>
                                <Card.Title>Building goal conditions</Card.Title>
                                <Card.Text>
                                    <p>Use this workspace to create your goal conditions. The same instructions apply as with initial conditions, except now you have composed conditions with categories available to you!</p>
                                    <p>
                                        <b>Important note:</b> the Basic Condition blocks will allow you to use both object instances and object categories. You can always use object instances, but it only makes sense to use object categories along with a "Composed Condition with Categories" composer. We won't be able to check if you use a category without such a constructor, so please be careful not to.
                                    </p>
                                </Card.Text>
                                <ConditionDrawer drawerType="goal"/>
                            </Card.Body>
                        </Card>
                        <Card className="marginCard" hidden={this.state.conditionDrawersHidden}>
                            <Card.Body>
                                <Card.Text>
                                    Take a minute to check your work and make sure you've said what you want to say, then press submit! It won't redirect, so let the interviewer know. Thanks so much for participating, we really appreciate it :) 
                                </Card.Text>
                                {/* <FinalSubmit/> */}
                                <SubmissionSection/>
                            </Card.Body>
                        </Card>
                    </Card.Body>
                </Card>
            </div>
        )
    }
}



