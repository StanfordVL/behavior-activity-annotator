import React from "react";
// import Tree from "./react-d3-src";
import Tree from "react-d3-tree"
import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from "react-bootstrap/esm/Popover";
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import Modal from 'react-bootstrap/Modal'


const nonSceneObjects = require('../pack_lunch_objects.json')

const containerStyles = {
  width: '100%',
  height: '100vh',
  fontSize: 40
}

const getJSONDepth = ({ children }) => 1 + (children ? Math.max(...children.map(getJSONDepth)) : 0)
let nonSceneObjectsDepth = getJSONDepth(nonSceneObjects);


export default class SmallObjectSelectionWorkspace extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      taskObjectsCurrentCategory: "",
      allObjectsCurrentCategory: ""
    }
  }

  onTreeNodeClick(nodeData, evt) {
    console.log('tree node clicked, record from SmallObjectSelectionWorkspace')
    console.log(nodeData.name)
    this.setState({ currentCategory: nodeData.name })
  }

  render() {
    return (
      <div>
        <ObjectHierarchy 
          onClick={(nodeData, event) => this.onTreeNodeClick(nodeData, event)}
          objectData={nonSceneObjects}
        />
        <AllObjectHierarchy
          onClick={(nodeData, event) => this.onTreeNodeClick(nodeData, event)}
        />
        <SmallObjectsSubmissionForm
          onSubmit={(numObjects, objectCategory) => this.props.onSubmit(numObjects, objectCategory)}
          objectCategory={this.state.taskObjectsCurrentCategory}
        />
      </div>
    )
  }
}


export class SmallObjectsSubmissionForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      inputText: ""
    }
  }

  onInputChange(event) {
    this.setState({ inputText: event.target.value })
  }

  onSubmit(event) {
    event.preventDefault();
    this.setState({ inputText: "" })
    this.props.onSubmit(parseInt(this.state.inputText), this.props.objectCategory)
  }

  render() {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Add <b>{this.props.objectCategory}</b></Card.Title>
          <Form
            onChange={(event) => this.onInputChange(event)}
            onSubmit={(event) => this.onSubmit(event)}
          >
            <Form.Group id="smallObjectSelections">
              {/* <Form.Label>Add <b>{this.props.objectCategory}</b></Form.Label> */}
              <Form.Control type="number" value={this.state.inputText}/>
            </Form.Group>
            <Button
              disabled={this.state.inputText.length==0 || this.props.objectCategory.length==0}
              variant="outline-dark"
              // size="sm"
              type="submit"
            >
              add
            </Button>
          </Form>
        </Card.Body>
      </Card>
    )
  }
}


export class AllObjectHierarchy extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      show: false,
      objectCategory: ''
    }
  }

  handleShow() {
    this.setState({ show: true })
  }

  handleHide() {
    this.setState({ show: false })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ show: false })
  }

  render() {
    return (
      <div>
        <Button variant="secondary" style={{ "margin": "20px" }}
          onClick={() => this.handleShow()}
        >
          All objects
        </Button>
        <Modal
          show={this.state.show}
          onHide={() => this.handleHide()}
          backdrop="static"
          keyboard={false}
          >
          <Modal.Header closeButton>
            <Modal.Title>All objects</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            All objects will go here 
          </Modal.Body>
          {/* <Modal.Footer> */}
            {/* <Button 
              variant="secondary"
              type="submit"
              onSubmit={(event) => this.handleSubmit(event)}
            >
              Add object
            </Button> */}
            {/* <Button 
              onClick={() => this.handleHide()}
              variant="secondary"
            >
              Cancel
            </Button> */}
            <ObjectHierarchy
              objectData={nonSceneObjects}
              onClick={(nodeData, evt) => this.props.onClick(nodeData, evt)}
            />
            <SmallObjectsSubmissionForm
              objectCategory={this.state.objectCategory}
              onSubmit={(numObjects, objectCategory) => this.handleSubmit(numObjects, objectCategory)}
            />
          {/* </Modal.Footer> */}
        </Modal>
      </div>
    )
  }
}


export class ObjectHierarchy extends React.PureComponent {
  state = {}

  componentDidMount() {
    const dimensions = this.treeContainer.getBoundingClientRect();
    this.setState({
      translate: {
        x: dimensions.width / 2,
        y: dimensions.height / 2
      }
    });
  }

  render() {
    return (
      <div style={containerStyles} ref={tc => (this.treeContainer = tc)}>
        <Tree 
          data={this.props.objectData} 
          translate={this.state.translate} 
          orientation={'horizontal'}
          nodeSvgShape = {
              {
                  shape: 'circle', 
                  shapeProps: {
                      r: 15,
                  }
              }
          }
          separation={{
              siblings: 0.3,
              nonSiblings: 0.5
          }}
          depthFactor={nonSceneObjectsDepth * 275 }
          textLayout={
            {textAnchor: "start", x: 15, y: -10, transform: undefined }
          }
          onClick={(nodeData, evt) => this.props.onClick(nodeData, evt)}
          // zoomable={false}
          zoom={0.4}
        />
      </div>
    );
  }
}

