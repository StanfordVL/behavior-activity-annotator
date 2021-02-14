import React from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Table from 'react-bootstrap/Table'
import Card from 'react-bootstrap/Card'

const activitiesToRoomsObjects = require('./activity_to_rooms_objects.json')

export default class SceneObjectTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            objectRows: 6,
        }
    }

    onObjectSubmit(numObjects, objectCategory) {
        console.log(objectCategory)
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
        // var rows = this.state.objectRows;
        // let cols = Math.ceil(objectArray.length / rows);
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
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        )
    }

    render() {
        let sceneObjects
        if (this.props.activityName.length !== 0 && this.props.room.length !== 0) {
            sceneObjects = activitiesToRoomsObjects[this.props.activityName][this.props.room]
        } else {
            sceneObjects = activitiesToRoomsObjects['installing_smoke_detectors']['corridor']
        }
        console.log('ROOM:', this.props.room)
        console.log('SCENE OBJECTS:', sceneObjects)
        return ( 
            <Card className="marginCard">
                <Card.Body>
                    <Card.Title>{this.props.room}</Card.Title>
                    { this.createObjectTable(sceneObjects) } 
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
            roomInput: "",
            objectCategory: this.props.objectCategory
        }

        this.createRoomButtons = this.createRoomButtons.bind(this)
    }

    onNumberChange(event) {
        this.setState({ numberInput: event.target.value })
    }

    onRoomChange(event) {
        this.setState({ roomInput: event.target.value })
    }

    onSubmit(event) {
        event.preventDefault();
        this.setState({ numberInput: "" })
        let cleanObjectCategory = this.state.objectCategory
        if (Object.keys(this.props.selectedRooms).length > 1) {
            cleanObjectCategory = this.state.objectCategory + ' (' + this.state.roomInput + ')'
        }
        this.props.onSubmit(parseInt(this.state.numberInput), cleanObjectCategory)
        console.log('FROM FORM SUBMIT:', this.state.roomInput)
    }

    createRoomButtons() {
        let rooms = this.props.selectedRooms 
        if (Object.keys(rooms).length > 1) {
            return (
                <div>
                    <Form.Label>In which room?</Form.Label><br/>
                    {Object.keys(rooms).map((roomType) => (
                        <Form.Check
                            type="radio"
                            id={`${roomType}-radio`}
                            label={roomType}
                            inline
                            value={roomType}
                            name="room-check"
                        />
                    ))}
                </div>
            )
        }
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
                        <Form.Control
                            type="number"
                            value={this.state.numberInput}
                            style={{ marginBotton: "5px" }}
                        />
                    </Form.Group>
                    <Form.Group         // TODO make this section conditioned on multiple rooms 
                        controlid="room"
                        onChange={(event) => this.onRoomChange(event)}
                    >
                        {this.createRoomButtons()}
                    </Form.Group>
                    <Button
                        disabled={
                            this.state.numberInput.length == 0 || 
                            (this.state.roomInput.length == 0 && Object.keys(this.props.selectedRooms).length > 1)
                        }
                        variant="outline-primary"
                        size="sm"
                        type="submit"
                    >
                        add
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
                    {this.createOverlayForm()}
                </Popover.Content>
            </Popover>
        )
    }

    render() {
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
    }
}