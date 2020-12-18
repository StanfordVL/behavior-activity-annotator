import React from "react";
import Tree from "./react-d3-src";
import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from "react-bootstrap/esm/Popover";
import Form from 'react-bootstrap/Form'


const sceneObjects = require('./pack_lunch_objects.json')

const containerStyles = {
  width: '100%',
  height: '100vh',
  fontSize: 40
}

const getJSONDepth = ({ children }) => 1 + (children ? Math.max(...children.map(getJSONDepth)) : 0)
let sceneObjectsDepth = getJSONDepth(sceneObjects);


class NodeLabel extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      inputText: ""
    }
  }

  onInputChange(event) {
    console.log('input change')
    this.setState({ inputText: event.target.value })
  }

  onSubmit(event) {
    event.preventDefault()
    this.setState({ inputText: "" })
    console.log('submission')
  }

  render() {
    console.log('clicked node label component')
    const {className, nodeData} = this.props
    return (
      <div className={className}>
        <h2>{nodeData.name}
        { 
          <OverlayTrigger
            trigger="click"
            placement="bottom"
            overlay={
              <Popover>
                <Popover.Content>
                  How many do you want?
                      <Form
                          onChange={(event) => this.onInputChange(event)}
                          onSubmit={(event) => this.onSubmit(event)}
                      >
                          <Form.Control type="number" value={this.state.inputText}/>
                          <Button
                              disabled={this.state.inputText.length == 0}
                              variant="outline-dark"
                              size="sm"
                              type="submit"
                          >
                              add
                          </Button>
                      </Form>
                </Popover.Content>
              </Popover>
            }
          
          >
            <Button size="lg" variant="secondary">
              add
            </Button>
          </OverlayTrigger>
        }
        </h2>
      </div>
    )
  }
}



export default class CenteredTree extends React.PureComponent {
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
          // zoomable={false}
          zoom={0.4}
          allowForeignObjects
          nodeLabelComponent={{
            render: <NodeLabel className='myLabelComponentInSvg' />,
            foreignObjectWrapper: {
              // y: 24
            }
          }}
    
        />
      </div>
    );
  }
}

