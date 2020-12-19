/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom'
import AirTable from 'airtable';
import $ from 'jquery'; 
import AirTableError from 'airtable/build/airtable.browser'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import CenteredTree from "./object_hierarchy.js";
import SceneObjectTable from './scene_object_table';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import SelectedObjectsList from './selected_objects_list';
import { ConditionInstruction, Introduction, ObjectSelectionWorkspace, ConditionWorkspace } from './instruction_sections'
import ConditionDrawer from './custom_blocks2'


let resultCodeObj;
const activityParameters = require('./pack_lunch_params.json')
window.sessionStorage.setItem('allSelectedObjects', JSON.stringify({'apple': 2, 'orange': 5}))

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
      allSelectedObjects: {},
      selectedRooms: {},

    };
  }

  componentDidMount() {
    console.log('APP MOUNTED')
  }

  updateSelectedObjects(updatedSelectedObjects) {
    console.log('from main app:', updatedSelectedObjects)
    this.setState({ allSelectedObjects: updatedSelectedObjects })
    window.sessionStorage.setItem('allSelectedObjects', JSON.stringify(updatedSelectedObjects));
  }

  updateSelectedRooms(updatedRooms) {
    this.setState({ selectedRooms: updatedRooms })
    console.log('CHOSEN ROOMS FROM APP:', updatedRooms)
    window.sessionStorage.setItem('selectedRooms', JSON.stringify(updatedRooms))
    let thing = JSON.parse(window.sessionStorage.getItem('selectedRooms'))
    console.log('STORED ROOMS:', thing)
  }

  render() { 
    console.log('CALLING INSTRUCTIONS RENDER')
    return (
      <div>
        <Card>
          <Card.Body>
            <h1>Defining household activities</h1>
            <h2>Activity: {activityParameters.activity_name}</h2>
          </Card.Body>
        </Card>
        <Introduction params={activityParameters}/>
        <ObjectSelectionWorkspace 
          params={activityParameters} 
          onObjectUpdate={(updatedSelectedObjects) => this.updateSelectedObjects(updatedSelectedObjects)}
          onRoomUpdate={(updatedRooms) => this.updateSelectedRooms(updatedRooms)}
        />
        <ConditionInstruction params={activityParameters}/>
        {/* <ConditionWorkspace selectedObjects={this.state.allSelectedObjects}/>  */}
      </div>
    )
  }
}

export class InstructionsPlusBlockly extends React.Component {
  render() {
    console.log('CALLING OUTERMOST RENDER')
    return (
      <div>
        <Instructions/>

        <ConditionWorkspace drawerType="initial"/>
      </div>
    )
  }
}


window.addEventListener('load', () => {
  const instructions = React.createElement(InstructionsPlusBlockly);
  ReactDOM.render(instructions, document.getElementById('root'));
});