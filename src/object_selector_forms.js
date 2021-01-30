import React from "react"
import Button from "react-bootstrap/esm/Button"
import Card from "react-bootstrap/esm/Card"
import Modal from "react-bootstrap/esm/Modal"
import Tree from "react-d3-tree"
import Form from "react-bootstrap/Form"

const allAdditionalObjects = require('./general_hierarchy.json')
const allActivityHierarchies = require('./all_activity_hierarchies.json')
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
        let activityAdditionalObjects
        if (this.props.activityName.length === 0) {
            activityAdditionalObjects = allActivityHierarchies.assembling_gift_baskets
        } else {
            activityAdditionalObjects = allActivityHierarchies[this.props.activityName]
            // activityAdditionalObjects = require('./pack_lunch_objects.json')
        }
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
                            objectData={allAdditionalObjects}
                            onSubmit={(numObjects, objectCategory) => this.props.onSubmit(numObjects, objectCategory)}
                        />
                    </Modal.Body>
                </Modal>
                <SmallObjectSelector
                    objectData={activityAdditionalObjects}
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

    onTreeNodeClick(nodeName) {
        this.setState({ currentCategory: nodeName.split('.')[0] })
    }

    render() {
        return (
            <div>
                <ObjectHierarchy
                    onNodeClick={(nodeName) => this.onTreeNodeClick(nodeName)}
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
                    depthFactor={600}
                    textLayout={{textAnchor: "start", x: 15, y: -10, transform: undefined}}
                    onNodeClick={(event) => this.props.onNodeClick(event.name)}
                    zoom={0.4}
                />
            </div>
        )
    }
}