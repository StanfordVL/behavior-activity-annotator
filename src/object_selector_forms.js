import React from "react"
import Button from "react-bootstrap/esm/Button"
import Card from "react-bootstrap/esm/Card"
import Modal from "react-bootstrap/esm/Modal"
import Tree from "react-d3-tree"
import Form from "react-bootstrap/Form"
// import { SmallObjectsSubmissionForm } from "./object_hierarchy"


const nonSceneObjects = require('./pack_lunch_objects.json')

// const getJSONDepth = ({ children }) => 1 + (children ? Math.max(...children.map(getJSONDepth)) : 0)

const containerStyles = {
    width: '100%',
    height: '100vh',
    fontSize: 40
}


export default class SmallObjectSelectionWorkspace extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showAllObjects: false
        }
    }

    onShow() {
        this.setState({ showAllObjects: true })
    }

    onHide() {
        this.setState({ showAllObjects: false })
    }

    render() {
        return (
            <div>
                <Button variant="primary" style={{"margin":"20px"}}
                    onClick={() => this.onShow()}
                >
                    All objects
                </Button>
                <Modal
                    show={this.state.showAllObjects}
                    onHide={() => this.onHide()}
                    // backdrop="static"
                    keyboard={false}
                    size="xl"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Select from all objects</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SmallObjectSelector
                            objectData={nonSceneObjects}
                            onSubmit={(numObjects, objectCategory) => this.props.onSubmit(numObjects, objectCategory)}
                        />
                    </Modal.Body>
                </Modal>
                <SmallObjectSelector
                    objectData={nonSceneObjects}
                    onSubmit={(numObjects, objectCategory) => this.props.onSubmit(numObjects, objectCategory)}
                />
            </div>
        )
    }
}


/* Object selector */

export class SmallObjectSelector extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentCategory: ""
        }
    }

    onTreeNodeClick(nodeData, evt) {
        this.setState({ currentCategory: nodeData.name })
    }

    render() {
        return (
            <div>
                <ObjectHierarchy
                    onClick={(nodeData, event) => this.onTreeNodeClick(nodeData, event)}
                    objectData={this.props.objectData}
                />
                <SmallObjectsSubmissionForm
                    onSubmit={(numObjects, objectCategory) => this.props.onSubmit(numObjects, objectCategory)}
                    objectCategory={this.state.currentCategory}
                />
            </div>
        )
    }
}


/* Basic object selector elements */

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
        event.preventDefault()
        this.setState({ inputText: "" })
        this.props.onSubmit(parseInt(this.state.inputText), this.props.objectCategory)
    }

    render() {
        return (
            <Card className="marginCard">
                <Card.Body>
                    <Card.Title>Add <b>{this.props.objectCategory}</b></Card.Title>
                    <Form
                        onChange={(event) => this.onInputChange(event)}
                        onSubmit={(event) => this.onSubmit(event)}
                    >
                        <Form.Group id="smallObjectSelections">
                            <Form.Control type="number" value={this.state.inputText}/>
                        </Form.Group>
                        <Button
                            disabled={this.state.inputText.length == 0 || this.props.objectCategory.length == 0}
                            variant="outline-primary"
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


export class ObjectHierarchy extends React.Component {

    state = {}

    componentDidMount() {
        const dimensions = this.treeContainer.getBoundingClientRect()
        this.setState({
            translate: {
                x: dimensions.width / 2,
                y: dimensions.height / 2
            }
        })
    }

    render() {
        return (
            <div style={containerStyles} ref={tc => (this.treeContainer = tc)}>
                <Tree
                    data={this.props.objectData}
                    translate={this.state.translate}
                    orientation={"horizontal"}
                    nodeSvgShape = {{
                        shape: "circle",
                        shapeProps: {
                            r: 15
                        }
                    }}
                    separation={{
                        siblings: 0.3,
                        nonSiblings: 0.5
                    }}
                    // depthFactor={getJSONDepth() * 275}
                    depthFactor={1100}
                    textLayout={{textAnchor: "start", x: 15, y: -10, transform: undefined}}
                    onClick={(nodeData, event) => this.props.onClick(nodeData, event)}
                    zoom={0.4}
                />
            </div>
        )
    }
}