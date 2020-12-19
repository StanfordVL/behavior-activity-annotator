import React from "react";
import Tree from "./react-d3-src";
// import Tree from "react-d3-tree"
import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from "react-bootstrap/esm/Popover";
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'


const sceneObjects = require('./pack_lunch_objects.json')

const containerStyles = {
  width: '100%',
  height: '100vh',
  fontSize: 40
}

const getJSONDepth = ({ children }) => 1 + (children ? Math.max(...children.map(getJSONDepth)) : 0)
let sceneObjectsDepth = getJSONDepth(sceneObjects);


export default class SmallObjectSelectionWorkspace extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentCategory: ""
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
        <CenteredTree onClick={(event) => this.onTreeNodeClick(event)}/>
        <SmallObjectsSubmissionForm
          onSubmit={(numObjects, objectCategory) => this.props.onSubmit(numObjects, objectCategory)}
          objectCategory={this.state.currentCategory}
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


export class CenteredTree extends React.PureComponent {
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
          data={sceneObjects} 
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
          depthFactor={sceneObjectsDepth * 275 }
          textLayout={
            {textAnchor: "start", x: 15, y: -10, transform: undefined }
          }
          // onClick={
          //   function(nodeData, evt) {
          //     console.log('right clicked!')
          //   }
          // }
          onClick={(nodeData, evt) => this.props.onClick(nodeData, evt)}
          zoomable={false}
          zoom={0.4}
          // allowForeignObjects
          // nodeLabelComponent={{
          //   render: <NodeLabel className='myLabelComponentInSvg' />,
          //   foreignObjectWrapper: {
          //     // y: 24
          //   }
          // }}
    
        />
      </div>
    );
  }
}

