/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom'
import AirTable from 'airtable';
import $ from 'jquery'; 
import AirTableError from 'airtable/build/airtable.browser'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import CenteredTree from "./object_hierarchy.js";
// import FinalConditionDrawer from './custom_blocks'
import SceneObjectTable from './scene_object_table';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import SelectedObjectsList from './selected_objects_list';
import { InitialConditionInstruction, Introduction, ObjectSelectionWorkspace, InitialConditionWorkspace } from './instruction_sections'

let resultCodeObj;
const activityParameters = require('./pack_lunch_params.json')

export default class Instructions extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      title: 'Create initial conditions.',
      activityName: 'Pack lunch for four people.',
      exampleSuperCat: "meat",
      exampleSubCat1: "chicken",
      exampleSubCat2: "turkey",
      exampleDescriptor: "cooked",
      allSelectedObjects: {}

    };
    this.handleSave = this.handleSave.bind(this);
    this.getSelectedObjects = this.getSelectedObjects.bind(this);
  }

  getSelectedObjects(selectedObjects) {
    this.setState({ allSelectedObjects: selectedObjects})
  }

  render() {

    console.log('render is called');
 
    return (
      <div>
        <Card>
          <Card.Body>
            <h1>Defining household activities</h1>
            <h2>Activity: {activityParameters.activity_name}</h2>
          </Card.Body>
        </Card>
        <Introduction params={activityParameters}/>
        <ObjectSelectionWorkspace params={activityParameters}/>
        <InitialConditionInstruction params={activityParameters}/>
        <InitialConditionWorkspace/>


        {/* <div id='conditiondescription'>
          <p>
            First, I need you to tell me what the world looks like when I have all 
            the objects I need to {this.state.activityName}, but before I have actually 
            done it. This is called <b>initial conditions</b>.
          </p>
          <p>
            Next, I need you to tell me what the world looks like when I have completed 
            "{this.state.activityName}". This is called <b>goal conditions</b>.
          </p>
          <p>
            This probably seems like a big ask, so I'm going to limit the world to just a 
            few objects and descriptors, and I'm going to tell you exactly what a "condition" 
            looks like.
          </p>
          <p>
            <b>Important note:</b> I am <b>not</b> asking you to tell me how to actually 
            <em>execute</em> the task. I want to know what the world looks like before I've
            done it (initial conditions) and after I've done it (goal conditions), but I don't 
            want you to tell me how to get from the initial conditions to the final conditions. 
          </p>
        </div>
        
        {/* Section 2: Describe the scene available */}
        <div id='scenetitle'>
          <h3>Setting up the scene.</h3>
        </div>
        <div id='sceneintro'>
          <p>
            First, I'll introduce you to the scene you have available for doing this task.
          </p>
        </div>
        <div id='sceneImages'>
          <p>[TODO click and drag interface of a few iGibson scenes]</p>
        </div>

        <div id='sceneObjects'> 
          <h5>Objects that make up your scene.</h5> 
          <p>
            First, choose the which furniture objects are relevant for your 
            initial and goal conditions. Don't worry about picking all the furniture
            and other scene objects you want for the house - we'll make sure to have a 
            realistic looking scene overall!
            Just tell us which ones you need for {this.state.activityName}. For example,
            if you need a table to do {this.state.activityName} and don't need a sofa, 
            even if you like the idea of having a sofa in the environment for aesthetics,
            add the table but not the sofa. 
          </p>
          {<SceneObjectTable onObjectSelect={this.getSelectedObjects}/>}
          {console.log('FROM MAIN APP:', this.state.allSelectedObjects)}
        </div>

        <div id="selectedobjects">
          <SelectedObjectsList selectedObjects={this.state.allSelectedObjects}/>
        </div>

        <div id='nonsceneObjects'>
          <p>
            <h5>Objects you don't see in the scene above.</h5>
            You also have the following objects available to you, but they aren't automatically 
            present. If you want to use these objects, click a label and add a number.
          </p>
          <p>
            <b>Important note:</b> These objects follow a hierarchy. You can use any word in your initial 
            and goal conditions. For example, {this.state.exampleSuperCat} is a supercategory of
            {this.state.exampleSubCat1} and {this.state.exampleSubCat2}. You can use {this.state.exampleSuperCat},
            {this.state.exampleSubCat1}, or {this.state.exampleSubCat2} in your description. The important thing 
            to remember is that if you say something applies to {this.state.exampleSuperCat}, e.g. 
            "{this.state.exampleSuperCat} is {this.state.exampleDescriptor}", that will apply to everything that is 
             {this.state.exampleSuperCat}, including {this.state.exampleSubCat1} and {this.state.exampleSubCat2}.
          </p>
          <p>
            [TODO:S. When an object label is clicked, it gives an option to add and asks how many, then spawns that many ground terms of the type.]
            <CenteredTree/>
            
            {/* {this.createObjectTable(objectData.nonsceneObjects)} */}
          </p>
          <p>
            You don't have to use all these objects! Just use the ones you find useful. If there's an object
            you want but you don't see here, we might have it in our full set of objects: click on "see more objects"
            to get a hierarchy of all the objects available.
          </p>
          <p>
            [TODO: option for seeing all objects]
          </p>          
        </div>

        {/* Section 3: Introduce condition format */}
        <div>
          <p>
            Here is your space to put all the objects you want. For the initial conditions, all objects have to be 
            specific: if you want four {this.state.exampleSubCat1}s, say so, and they'll be labeled 
            {this.state.exampleSubCat1}1, {this.state.exampleSubCat1}2, {this.state.exampleSubCat1}3, and {this.state.exampleSubCat1}4.
          </p>
        </div>

        <div>
          {/* {<FinalConditionDrawer/>} */}
        </div>

        <div id='submit'>
          <Button 
            onClick={this.handleSave} 
            id="submitbutton"
            variant="outline-dark"
            size="lg"
          >
            Save Final State
          </Button>
        </div> */}
      </div>
    )
  }

  handleSave() {
   
      var base = new AirTable({apiKey: 'keyeaIvUAzmIaj3ma'}).base('appIh5qQ5m4UMrcps');
      const {code} = this.state;
      console.log('code', resultCodeObj);
     

      const requestOptions = {
        method: 'POST',
        headers: {'Content-Type':'application/json',  "Authorization": "Bearer keyeaIvUAzmIaj3ma" },
        body:JSON.stringify({
          "records": [
            {
              "fields": {
                "TestSubject": "Test",
                "Results": `${resultCodeObj}`
              }
            }
          ]
        })
    };
    fetch('https://api.airtable.com/v0/appIh5qQ5m4UMrcps/Table%201', requestOptions)
        .then(response => response.json())

    console.log('sucess');
  }
}


window.addEventListener('load', () => {
  const instructions = React.createElement(Instructions);
  ReactDOM.render(instructions, document.getElementById('root'));
});