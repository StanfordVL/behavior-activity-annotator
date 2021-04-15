import React from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Table from 'react-bootstrap/Table'
import Card from 'react-bootstrap/Card'

import { getSceneSynset } from "./constants.js"

const activitiesToRoomsObjects = require('./data/activity_to_rooms_objects.json')

export default class SceneObjectTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            objectRows: 6,
        }
    }

    onObjectSubmit(numObjects, objectCategory) {
        this.props.onObjectSubmit(numObjects, objectCategory)
    }

    getObjectCategory(objectArray, r, c, cols) {
        let numObjects = objectArray.length;
        let objectIndex = (cols * r) + c;
        var objectCategory;
        if (objectIndex < numObjects) {
            objectCategory = objectArray[objectIndex];
        } else {
            objectCategory = "";
        }
        return (objectCategory);
    }

    createObjectTable(objectData) {
        let objectArray = Object.keys(objectData)
        let cols = 3
        let rows = Math.ceil(objectArray.length / cols)

        return (
            <Table striped bordered responsive>
                <tbody>
                    {Array.from({ length: rows }).map((_, r) => (
                        <tr key={r}>
                            {Array.from({ length: cols }).map((_, c) => (
                                <ObjectTableCell
                                    objectCategory={this.getObjectCategory(objectArray, r, c, cols)}
                                    key={c}
                                    onSubmit={(numObjects, objectCategory) => this.onObjectSubmit(numObjects, objectCategory)}
                                    selectedRooms={this.props.selectedRooms}
                                    room={this.props.room}
                                    count={objectData[this.getObjectCategory(objectArray, r, c, cols)]}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        )
    }

    render() {
        // Get scene objects for room from documentation 
        let roomSceneObjects
        if (this.props.activityName.length !== 0 && this.props.room.length !== 0) {
            roomSceneObjects = activitiesToRoomsObjects[this.props.activityName][this.props.room]
        } else {
            roomSceneObjects = activitiesToRoomsObjects['installing_smoke_detectors']['corridor']
        }

        // Convert to synsets. If there are two of the same synset, add the counts.
        let roomSceneSynsets = {}
        for (const [roomSceneObject, numInstances] of Object.entries(roomSceneObjects)) {
            const roomSceneSynset = getSceneSynset(roomSceneObject)
            if (roomSceneSynset in roomSceneSynsets) {
                roomSceneSynsets[roomSceneSynset] += numInstances
            } else {
                roomSceneSynsets[roomSceneSynset] = numInstances
            }
        }

        // Make scene object table with synsets
        return ( 
            <Card className="marginCard">
                <Card.Body>
                    <Card.Title>{this.props.room}</Card.Title>
                    <Card.Text>Note that unlike before, whatever you choose will <b>be</b>, not add to, the total. If you pick 4, you will have 4 even if you previously had 3 or 7 or any other number. You can still delete instances in the object list.
</Card.Text>
                    { this.createObjectTable(roomSceneSynsets) } 
                </Card.Body>
            </Card>
        )
    }
}


class ObjectTableCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            numberInput: "",
            objectCategory: this.props.objectCategory
        }
    }

    onNumberChange(event) { this.setState({ numberInput: event.target.value }) }

    onSubmit(event) {
        event.preventDefault();
        this.setState({ numberInput: "" })
        let cleanObjectCategory = this.state.objectCategory
        if (Object.keys(this.props.selectedRooms).length > 1) {
            cleanObjectCategory = this.state.objectCategory + ' (' + this.props.room + ')'
        }
        this.props.onSubmit(parseInt(this.state.numberInput), cleanObjectCategory)
    }

    createOverlayForm() {
        return (
            <div>
                <Form
                    onSubmit={(event) => this.onSubmit(event)}
                >
                    <Form.Group 
                        controlid="numObjects" 
                        onChange={(event) => this.onNumberChange(event)}
                    >
                        <Form.Label>How many do you want?</Form.Label>
                        {/* <Form.Control
                            type="number"
                            value={this.state.numberInput}
                            style={{ marginBotton: "5px" }}
                        /> */}
                        <Form.Control as="select">
                            {Array.from({ length: this.props.count + 1}).map((_, i) => 
                                <option>{i}</option>
                            )}
                        </Form.Control>
                    </Form.Group>
                    <Button
                        disabled={this.state.numberInput.length == 0}
                        variant="outline-primary"
                        size="sm"
                        type="submit"
                    >
                        select
                    </Button>
                </Form>
            </div>
        )
    }

    createOverlay() {
        return (
            <Popover>
                <Popover.Title as="h3">Add <b>{this.props.objectCategory}</b></Popover.Title>
                <Popover.Content>
                    {this.createOverlayForm(this.props.count)}
                </Popover.Content>
            </Popover>
        )
    }
    

    render() {
        if (this.props.objectCategory.length > 0) {
            return (
                <OverlayTrigger
                    trigger="click"
                    placement="bottom"
                    overlay={this.createOverlay()}
                >
                    <td key={this.props.key}>
                        {this.props.objectCategory}
                    </td>
                </OverlayTrigger>
            )
        } else {
            return (
                <td key={this.props.key}>
                    {this.props.objectCategory}
                </td>
            )
        }
    }
}