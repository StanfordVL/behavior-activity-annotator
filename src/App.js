/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { ObjectSelectionWorkspace, ConditionWorkspace } from './instruction_sections'
import Introduction from './written_instructions'

const activityParameters = require('./data/pack_lunch_params.json')
// Start out with stub object selections, ensure the checker is shown as not ready and not busy, 
window.sessionStorage.setItem('allSelectedObjects', JSON.stringify({'apple': 2, 'orange': 5})) 
window.sessionStorage.setItem("room", JSON.stringify({stub: null}))
window.sessionStorage.setItem("serverReady", JSON.stringify(false))
window.sessionStorage.setItem("serverBusy", JSON.stringify(false))
// TODO send a teardown and put the line below in the .then?
window.sessionStorage.setItem("uuids", JSON.stringify([]))


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