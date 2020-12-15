import React from 'react';
import Card from 'react-bootstrap/Card';
import CenteredTree from './object_hierarchy';

import SceneObjectTable from './scene_object_table';
import SelectedObjectsList from './selected_objects_list'
import ConditionDrawer from './custom_blocks'
import ConditionWritingInstructions from './condition_writing_instructions'


export class Introduction extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <div  id="introduction"> 
                <Card>
                    <Card.Body>
                        <h4>Introduction</h4>
                        <Card.Text>
                        <p>
                            First, I need you to tell me what the world looks like when I have all the objects I need to {this.props.params.activityName}, but before I have actually done it. This is called <b><em>initial conditions</em></b>,
                        </p>
                        <p>
                            Next, I need you to tell me what the world looks like when I have completed "{this.props.params.activityName}". This is called <b><em>goal conditions</em></b>.
                        </p>
                        <p>
                            This probably seems like a big ask, so I'm going to limit the wrold to just a few objects and descriptors, and I'm going to tell you exactly what a "condition" looks like.
                        </p>
                        <p>
                            <b>Important note:</b> I am <b>not</b> asking you to tell me how to actually <em>execute</em> the task. I want to know what the world looks like before I've done it (initial conditions) and after I've done it (goal conditions), but I don't want you to tell me how to get from the initial conditions to the goal conditions. 
                        </p>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>
        )
    }
}

export class ObjectSelectionWorkspace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allSelectedObjects: {}
        }

        // this.getSelectedObjects = this.getSelectedObjects.bind(this);
    }

    // getSelectedObjects(selectedObjects) {
    //     this.setState({ allSelectedObjects: selectedObjects })
    // }

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

    render() {
        return (
            <div>
                <Card>
                    <Card.Body>
                        <h4>Setting up the scene</h4>
                        <Card.Text>
                        <p>
                            First, I'll introduce you to the scene you have available for doing this task.
                        </p>
                        <p>
                            [TODO drag-nav interface of a few igibson scenes]
                        </p>
                        </Card.Text>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <Card.Text>
                        <h4>Objects that make up your scene</h4>
                        <p>
                            First, choose which scene objects are relevant for your initial and goal conditions. Scene objects (listed in the table below) are generally furniture or other background objects you see in a clean home. Don't worry about picking all the furniture and other scene objects you want for the house - as you can see, we've already set up realistic looking scenes. Just tell us which ones you need to do {this.props.params.activityName}. For example, if you need a table to do {this.props.params.activityName} but don't need a sofa, even if you like the idea of having a sofa in the environment for aesthetic reasons, choose the table but not the sofa. 
                        </p>
                        <SceneObjectTable onObjectSubmit={(numObjects, objectCategory) => this.updateSelectedObjects(numObjects, objectCategory)}/>
                        <SelectedObjectsList
                            onObjectDelete={(numObjects, objectCategory) => this.updateSelectedObjects(numObjects, objectCategory)}
                            selectedObjects={this.state.allSelectedObjects}
                        />
                        </Card.Text>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <h4>Objects you don't see in the scene above</h4>
                        <Card.Text>
                        <p>
                            You also have the following objects available to you. Unlike the scene objects, these aren't automatically present. If you want to use these objects, click a label and add a number.
                        </p>
                        <p>
                            You don't have to use all these objects! Just use the ones you find useful. If there's an object you want but you don't see here, we might have it in our full set of objects. Click "see more objects" to get a hierarchy of all the objects available.
                        </p>
                        <p>
                            <b>Important note:</b> as you can see, these objects follow a hierarchy. You can use any word in your initial and goal conditions. For example, {this.props.params.example_super_cat} is a supercategory of {this.props.params.example_sub_cat1} and {this.props.params.example_sub_cat2}. You can use {this.props.params.example_super_cat}, {this.props.params.example_sub_cat1}, or {this.props.params.example_sub_cat2} in your description. The important thing to remember is that if you say something applies to {this.props.params.example_super_cat}, e.g. "{this.props.params.example_super_cat} is {this.props.params.example_descriptor}", that will apply to <em>every object</em> that is {this.props.params.example_super_cat}, including any object that is {this.props.params.example_sub_cat1} or {this.props.params.example_sub_cat2}.
                        </p>
                        [TODO: click to add objects, ideally into the list already started for scene objects]
                        </Card.Text>
                        <CenteredTree/>
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
                        <Card.Title>Building initial conditions</Card.Title>
                        <ConditionDrawer drawerType="initial" selectedObjects={this.props.selectedObjects}/>
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body>
                        <Card.Title>Building goal conditions</Card.Title>
                        <ConditionDrawer drawerType="goal" selectedObjects={this.props.selectedObjects}/>
                    </Card.Body>
                </Card>
            </div>
        )
    }
}


// export class SubmitButton extends React.Component {
//     render() {

//     }
// }


