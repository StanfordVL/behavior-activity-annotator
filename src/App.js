/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom'
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
const activityParameters = require('./data/pack_lunch_params.json')
window.sessionStorage.setItem('allSelectedObjects', JSON.stringify({'apple': 2, 'orange': 5}))

export default class Instructions extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      title: 'Create initial conditions.',
      allSelectedObjects: {},
      selectedRooms: {},
      sceneSelectHidden: true,
      conditionWorkspaceHidden: true,
      activityName: ""
    };

    this.onSeeSceneSelection = this.onSeeSceneSelection.bind(this)
    this.onSeeConditionWorkspace = this.onSeeConditionWorkspace.bind(this)
  }

  updateSelectedObjects(updatedSelectedObjects) {
    this.setState({ allSelectedObjects: updatedSelectedObjects })
    window.sessionStorage.setItem('allSelectedObjects', JSON.stringify(updatedSelectedObjects));
  }

  updateSelectedRooms(updatedRooms) {
    this.setState({ selectedRooms: updatedRooms })
  }

  onSeeSceneSelection() {
    this.setState({ sceneSelectHidden: false })
  }

  onSeeConditionWorkspace() {
    this.props.onSeeConditionWorkspace()
  }

  onActivityNameSubmit(activityName) {
    this.setState({ activityName: activityName })
  }

  render() { 
    return (
      <div>
        <Introduction
          onSeeSceneSelection={this.onSeeSceneSelection}
          onActivityNameSubmit={(activityName) => this.onActivityNameSubmit(activityName)}
        />
        <ObjectSelectionWorkspace
          params={activityParameters}
          onObjectUpdate={(updatedSelectedObjects) => this.updateSelectedObjects(updatedSelectedObjects)}
          onRoomUpdate={(updatedRooms) => this.updateSelectedRooms(updatedRooms)}
          hidden={this.state.sceneSelectHidden}
          onSeeConditionWorkspace={this.onSeeConditionWorkspace}
          activityName={this.state.activityName}
        />
      </div>
    )
  }
}

export class InstructionsPlusBlockly extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      conditionWorkspaceHidden: true 
    }
    
    this.onSeeConditionWorkspace = this.onSeeConditionWorkspace.bind(this)
  }

  onSeeConditionWorkspace() {
    this.setState({ conditionWorkspaceHidden: false })
  }

  render() {
    return (
      <div>
        <Instructions onSeeConditionWorkspace={this.onSeeConditionWorkspace}/>
        <ConditionWorkspace drawerType="initial" hidden={this.state.conditionWorkspaceHidden} />
      </div>
    )
  }
}


window.addEventListener('load', () => {
  const instructions = React.createElement(InstructionsPlusBlockly);
  ReactDOM.render(instructions, document.getElementById('root'));
});