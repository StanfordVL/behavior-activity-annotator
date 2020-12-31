/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom'
import AirTable from 'airtable';
import $ from 'jquery'; 
import AirTableError from 'airtable/build/airtable.browser'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import SceneObjectTable from './scene_object_table';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import SelectedObjectsList from './selected_objects_list';
import { ConditionInstruction, ObjectSelectionWorkspace, ConditionWorkspace } from './instruction_sections'
import ConditionDrawer, { FinalSubmit } from './blockly_drawers'
import Introduction from './written_instructions'


let resultCodeObj;
const activityParameters = require('./pack_lunch_params.json')
window.sessionStorage.setItem('allSelectedObjects', JSON.stringify({'apple': 2, 'orange': 5}))

export default class Instructions extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      title: 'Create initial conditions.',
      allSelectedObjects: {},
      selectedRooms: {},

    };
  }

  componentDidMount() {
    console.log('APP MOUNTED')
  }

  updateSelectedObjects(updatedSelectedObjects) {
    // console.log('from main app:', updatedSelectedObjects)
    this.setState({ allSelectedObjects: updatedSelectedObjects })
    window.sessionStorage.setItem('allSelectedObjects', JSON.stringify(updatedSelectedObjects));
  }


  updateSelectedRooms(updatedRooms) {
    this.setState({ selectedRooms: updatedRooms })
  }

  showIntroduction() {
    return( <Introduction/> )
  }

  showObjectSelectionWorkspace() {
    return(
      <ObjectSelectionWorkspace
        params={activityParameters}
        onObjectUpdate={(updatedSelectedObjects) => this.updateSelectedObjects(updatedSelectedObjects)}
        onRoomUpdate={(updatedRooms) => this.updateSelectedRooms(updatedRooms)}
      />
    )
  }

  render() { 
    // console.log('CALLING INSTRUCTIONS RENDER')
    // console.log('SELECTED ROOMS:', Object.keys(this.state.selectedRooms).length)
    return (
      <div>
        {this.showIntroduction()}
        {this.showObjectSelectionWorkspace()}
      </div>
    )
  }
}

export class InstructionsPlusBlockly extends React.Component {
  render() {
    // console.log('CALLING OUTERMOST RENDER')
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