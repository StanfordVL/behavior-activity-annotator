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
  height: '50vh',
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
          orientation={'vertical'}
        />
      </div>
    );
  }
}
