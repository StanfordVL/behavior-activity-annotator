import React from "react";
import Tree from "react-d3-tree";


const sceneObjects = require('./pack_lunch_objects.json')

const containerStyles = {
  width: '100%',
  height: '100vh',
  fontSize: 40
}

// const getDepth = ({ children }) => 1 + (children ? Math.max(...children.map(getDepth)) : 0)

// function getObjectJSONDepth(jsonData, depth=0) {
//   var totalDepth = depth;
//   for (let prop in jsonData) {
    
//   }
// }

const getJSONDepth = ({ children }) => 1 + (children ? Math.max(...children.map(getJSONDepth)) : 0)
let sceneObjectsDepth = getJSONDepth(sceneObjects);


export default class CenteredTree extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
    this.handleRightClick = this.handleRightClick.bind(this);
  }

  componentDidMount() {
    const dimensions = this.treeContainer.getBoundingClientRect();
    this.setState({
      translate: {
        x: dimensions.width / 2,
        y: dimensions.height / 2
      }
    });

    // add right click listener 

  }

  render() {
    console.log('DEPTH:', sceneObjectsDepth);
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
          depthFactor={sceneObjectsDepth * 275 }
          textLayout={
            {textAnchor: "start", x: 15, y: -10, transform: undefined }
          }
          onRightClick={
            function(nodeData, evt) {
              console.log('right clicked!')
            }
          }
          zoomable={false}
          zoom={0.4}
        />
      </div>
    );
  }
}


class TreeContextMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      xPos: "0px",
      ypos: "0px",
      showMenu: false
    }

    this.handleContextMenu = this.handleContextMenu.bind(this);
  }

  componentDidMount() {
    // document.addEventListener("click", this.handleClick);
    document.addEventListener("contextmenu", this.handleContextMenu);
  }

  componentWillUnmount() {
    document.removeEventListener("contextmenu", this.handleContextMenu);
  }

  handleContextMenu(event) {
    event.preventDefault();
    this.setState({
      xPos: `${e.pageX}px`,
      yPos: `${e.pageY}px`,
      showMenu: true
    })
  }

  render() {

  }
}