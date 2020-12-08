import React from "react";
import Tree from "react-d3-tree";

const debugData = [
  {
    name: "1",
    children: [
      {
        name: "2"
      },
      {
        name: "2"
      }
    ]
  }
];

const sceneObjects = require('./pack_lunch_objects.json')

const containerStyles = {
  width: '100%',
  height: '100vh',
  fontSize: 40
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
              siblings: 0.25,
              nonSiblings: 0.5
          }}
          depthFactor={800}
          textLayout={
            {textAnchor: "start", x: 15, y: -10, transform: undefined }
          }
        />
      </div>
    );
  }
}
