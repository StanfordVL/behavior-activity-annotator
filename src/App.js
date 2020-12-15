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
import { ConditionInstruction, Introduction, ObjectSelectionWorkspace, ConditionWorkspace } from './instruction_sections'

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
    // this.getSelectedObjects = this.getSelectedObjects.bind(this);
  }

  // getSelectedObjects(selectedObjects) {
  //   this.setState({ allSelectedObjects: selectedObjects})
  // }

  updateSelectedObjects(updatedSelectedObjects) {
    console.log('from main app:', updatedSelectedObjects)
    this.setState({ allSelectedObjects: updatedSelectedObjects })
  }

  render() { 
    console.log('from main app state:', this.state.allSelectedObjects)
    return (
      <div>
        <Card>
          <Card.Body>
            <h1>Defining household activities</h1>
            <h2>Activity: {activityParameters.activity_name}</h2>
          </Card.Body>
        </Card>
        <Introduction params={activityParameters}/>
        <ObjectSelectionWorkspace params={activityParameters} onObjectUpdate={(updatedSelectedObjects) => this.updateSelectedObjects(updatedSelectedObjects)}/>
        <ConditionInstruction params={activityParameters}/>
        <ConditionWorkspace selectedObjects={this.state.allSelectedObjects}/> 
      </div>
    )
  }
}


window.addEventListener('load', () => {
  const instructions = React.createElement(Instructions);
  ReactDOM.render(instructions, document.getElementById('root'));
});