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
import Form from 'react-bootstrap/Form';
import ReactBlockly from 'react-blockly';
import ConfigFiles from './blockly_content';
import parseWorkspaceXml from './blockly_helper';
import { BlocklyToolboxBlock, BlocklyEditor, BlocklyToolbox, BlocklyToolboxCategory, BlocklyWorkspace } from 'react-blockly';
// import Tree from 'react-tree-graph';
import Tree from "react-d3-tree";
import CenteredTree from "./centered_tree.js";

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
      activityName: 'Pack lunch for four people.',
      objectRows: 6,
      toolboxCategories: parseWorkspaceXml(ConfigFiles.INITIAL_TOOLBOX_XML),
      exampleSuperCat: "meat",
      exampleSubCat1: "chicken",
      exampleSubCat2: "turkey",
      exampleDescriptor: "cooked"

    };
    this.createObjectTable = this.createObjectTable.bind(this);
    this.createObjectTableBody = this.createObjectTableBody.bind(this);
    this.createObjectTableRow = this.createObjectTableRow.bind(this);
    this.createObjectTableCell = this.createObjectTableCell.bind(this);
    this.handleSave = this.handleSave.bind(this);

    // this.onClickExample = this.onClickExample.bind(this);
  }

  treeOnClick(event, nodeKey) {
    alert(`Left clicked ${nodeKey}`);
  }
  
  treeOnRightClick(event, nodeKey) {
    event.preventDefault();
    alert(`Right clicked ${nodeKey}`);
  }

  render() {

    let data = {
      name: 'Parent',
      children: [{
          name: 'Child One'
      }, {
          name: 'Child Two'
      }]
  };
   

    console.log('render is called');
 
    return (
      <div>

        <div id='experimenttitle'>
          <h1>Defining household activities.</h1>
        </div>

        {/* Section 1: Describe the activity and annotation process */}
        <div id='activityname'>
          <h3>Activity: {this.state.activityName} </h3>
        </div>

        <div id='conditiondescription'>
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
          <p>
            Select the room(s) you think "{this.state.activityName}" would be done in.
            We think the majority of these activities can be done in one room, but there are 
            clear exceptions - e.g. bringing in groceries from the garage would probably need 
            both a garage and a kitchen. So only pick what you really need to make a reasonable 
            setup, but if that involves more than one room, that works!
          </p>
        <div id='roomselection'>
          <p>
            <Form>
              <div key={`room-options`} className="mb-3">
                <Form.Check
                  type='checkbox'
                  id={`kitchen-checkbox`}
                  label={`kitchen`}
                />
                <Form.Check
                  type='checkbox'
                  id={`bedroom-checkbox`}
                  label={`bedroom`}
                />
                <Form.Check
                  type='checkbox'
                  id={`bathroom-checkbox`}
                  label={`bathroom`}
                />
                <Form.Check
                  type='checkbox'
                  id={`garage-checkbox`}
                  label={`garage`}
                />
                <Form.Check
                  type='checkbox'
                  id={`livingroom-checkbox`}
                  label={`living room`}
                />
              </div>
            </Form>
          </p>
        </div>

        <div id='sceneImages'>
          <p>[TODO Once rooms are selected, examples of those rooms in iG will appear here.
            Images, or navigable rooms if possible.]</p>
        </div>

        <div id='sceneObjects'> 
          <h5>Objects you see in the scene above.</h5> 
          These will be present in the scene no matter what, 
          so your conditions cannot ask for them to not exist in the scene. However, you don't have to 
          use them in your conditions. [TODO refine this]
          {this.createObjectTable(objectData.sceneObjects)}
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
            [TODO: an interactive tree that lays out object taxonomy. When an object label is clicked,
            it gives an option to add and asks how many, then spawns that many ground terms of the type.]
            {/* <div className="custom-container">
              <Tree
                  data={data}
                  height={400}
                  width={400}
                  gProps={{
                    onClick: this.treeOnClick,
                    onContextMenu: this.treeOnRightClick}}
                  svgProps={{
                    className: 'custom'}}
              />
            </div> */}
            <CenteredTree/>
            
            {this.createObjectTable(objectData.nonsceneObjects)}
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