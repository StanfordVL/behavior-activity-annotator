/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom'
import Blockly from 'blockly';
import AirTable from 'airtable';
import $ from 'jquery'; 
import AirTableError from 'airtable/build/airtable.browser'
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// import Dropdown from 'react-bootstrap/Dropdown';
import Table from 'react-bootstrap/Table';
import ReactBlockly from 'react-blockly';
import ConfigFiles from './blockly_content';
import parseWorkspaceXml from './blockly_helper';
import { BlocklyToolboxBlock, BlocklyEditor, BlocklyToolbox, BlocklyToolboxCategory, BlocklyWorkspace } from 'react-blockly';

import { objectData } from "./clean_bedroom_objects";
let resultCodeObj;

export default class TestEditor extends React.Component {
  constructor(props) {
    super(props);
    let allToolboxCategories = parseWorkspaceXml(ConfigFiles.INITIAL_TOOLBOX_XML);
    let ourToolboxCategories = [allToolboxCategories[0], allToolboxCategories[1], allToolboxCategories[7]];
    this.state = {
      toolboxCategories: ourToolboxCategories,
      resultCode: {}
    };
    console.log(this.state.toolboxCategories);
  }

  componentDidMount = () => {
    window.setTimeout(() => {
      this.setState({
        toolboxCategories: this.state.toolboxCategories.concat([
          {
            blocks: [
              { type: 'text' },
              {
                type: 'text_print',
                values: {
                  TEXT: {
                    type: 'text',
                    shadow: true,
                    fields: {
                      TEXT: 'abc',
                    },
                  },
                },
              },
            ],
          },
        ]),
      });
    }, 2000);

    window.setTimeout(() => {
      this.setState({
        toolboxCategories: [
          ...this.state.toolboxCategories.slice(0, this.state.toolboxCategories.length - 1),
          {
            ...this.state.toolboxCategories[this.state.toolboxCategories.length - 1],
            blocks: [
              { type: 'text' },
            ],
          },
        ],
      });
    }, 4000);

    window.setTimeout(() => {
      this.setState({
        toolboxCategories: this.state.toolboxCategories.slice(0, this.state.toolboxCategories.length - 1),
      });
    }, 10000);
  }

  workspaceDidChange = (workspace) => {
    workspace.registerButtonCallback('myFirstButtonPressed', () => {
      alert('button is pressed');
    });
    const newXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    document.getElementById('generated-xml').innerText = newXml;

    const code = Blockly.JavaScript.workspaceToCode(workspace);
    document.getElementById('code').value = code;
    resultCodeObj = code;
    this.setState({resultCode: code})
  }

  render = () => (

    <ReactBlockly
      toolboxCategories={this.state.toolboxCategories}
      workspaceConfiguration={{
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true,
        },
      }}
      initialXml={ConfigFiles.INITIAL_XML}
      wrapperDivClassName="fill-height"
      workspaceDidChange={this.workspaceDidChange}
    />
  )
}

// class BlocklyEditor extends React.Component {

// }

class Instructions extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      title: 'Create initial conditions.',
      activityName: 'Set table for four people.',
      objectRows: 6,
      toolboxCategories: parseWorkspaceXml(ConfigFiles.INITIAL_TOOLBOX_XML),

    };
    this.createObjectTable = this.createObjectTable.bind(this);
    this.createObjectTableBody = this.createObjectTableBody.bind(this);
    this.createObjectTableRow = this.createObjectTableRow.bind(this);
    this.createObjectTableCell = this.createObjectTableCell.bind(this);
    this.handleSave = this.handleSave.bind(this);

    // this.onClickExample = this.onClickExample.bind(this);
  }

  render() {

    console.log('render is called');
 
    return (
      <div>
        <div id='title'>
          <h1>{this.state.title}</h1>
        </div>

        <div id='activityName'>
          <h2>Activity: {this.state.activityName}</h2>
        </div>
        
        <div id='instructions'>
          <h2>Instructions</h2>
          <p>TODO instructions</p>
        </div>

        <div id='navScene'>
          <p>TODO add navigable iGibson scene</p>
        </div>

        <div id='sceneObjects'> 
          <b>Objects you see in the scene above.</b> These will be present in the scene no matter what, so your conditions cannot ask for them to not exist in the scene. However, you don't have to use them in your conditions.
          {this.createObjectTable(objectData.sceneObjects)}
        </div>

        <div id='nonsceneObjects'>
          <b>Objects you do not see in the scene above, but are relevant to the activity.</b> If you give us conditions for any of these objects, they will exist and follow those conditions. If you say there should be 0, there won't be any. If you don't say anything about an object, there are no guarantees on whether and how it will be present.
          {this.createObjectTable(objectData.nonsceneObjects)}
        </div>

        <div id='submit'>
          <button onClick={this.handleSave} id="create">
            Save

          </button>
        </div>
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





  createObjectTableCell(objectArray, r, c, cols) {
    let numObjects = objectArray.length;
    let objectIndex = (cols * r) + c;
    var cellValue;
    if (objectIndex < numObjects) {
      cellValue = objectArray[objectIndex];
    } else {
      cellValue = '';
    }
    return (cellValue);
  }

  createObjectTableRow(objectArray, r, cols) {
    return (Array.from({ length: cols }).map((_, c) => (
      <td key={c}>
        {this.createObjectTableCell(objectArray, r, c, cols)}
      </td>
    )))
  }

  createObjectTableBody(objectArray, cols) {
    return (
      Array.from({ length: this.state.objectRows }).map((_, r) => (
        <tr key={r}>
          {this.createObjectTableRow(objectArray, r, cols)}
        </tr>
      ))
    )
  }

  createObjectTable(objectArray) {

    var rows = this.state.objectRows;
    let cols = Math.ceil(objectArray.length / rows);
    return (
      <Table striped bordered responsive>
        <tbody>
          {/* {this.createObjectTableBody(objectArray, cols)} */}
          {Array.from({ length: this.state.objectRows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  {this.createObjectTableCell(objectArray, r, c, cols)}
                </td>
              ))}
            </tr>
          ))}
          
        </tbody>
      </Table>
    )
  } 
}

window.addEventListener('load', () => {
  const instructions = React.createElement(Instructions);
  const editor = React.createElement(TestEditor);
  ReactDOM.render(instructions, document.getElementById('root'));
  ReactDOM.render(editor, document.getElementById('blockly'));
});