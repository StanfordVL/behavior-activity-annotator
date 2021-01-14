import React from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Table from 'react-bootstrap/Table'


const sceneObjects = require('./scene_objects.json').sceneObjects;


export default class SceneObjectTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            objectRows: 6,
        }
    }

    onObjectSubmit(numObjects, objectCategory) {
        console.log('submitted in SceneObjectTable3')
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

    createObjectTable(objectArray) {
        var rows = this.state.objectRows;
        let cols = Math.ceil(objectArray.length / rows);

        return (
            <Table striped bordered responsive>
                <tbody>
                    {Array.from({ length: this.state.objectRows }).map((_, r) => (
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
        return (this.createObjectTable(sceneObjects))
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
                        controlID="numObjects" 
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
                        controlID="room"
                        onChange={(event) => this.onRoomChange(event)}
                    >
                        {this.createRoomButtons()}
                    </Form.Group>
                    <Button
                        disabled={
                            this.state.numberInput.length == 0 || 
                            (this.state.roomInput.length == 0 && Object.keys(this.props.selectedRooms).length > 1)
                        }
                        variant="primary-dark"
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