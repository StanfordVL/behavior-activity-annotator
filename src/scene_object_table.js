import React from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Table from 'react-bootstrap/Table'


const objectData = require('./scene_objects.json');


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

    // createObjectTableCell(objectArray, r, c, cols) {
    //     objectCategory = this.getObjectCategory(objectArray, r, c, cols)
    //     return (
    //         <ObjectTableCell
    //             objectCategory={objectCategory}
    //             key={c}
    //             onSubmit={(numObjects, objectCategory) => this.onObjectSubmit(numObjects, objectCategory)}
    //         />
    //     )
    // }

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
                                />
                            ))}
                        </tr>
                        // this.createObjectTableCell(objectArray, r, c, cols)
                    ))}
                </tbody>
            </Table>
        )
    }

    render() {
        return (this.createObjectTable(objectData.sceneObjects))
    }
}


class ObjectTableCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputText: "",
            objectCategory: this.props.objectCategory
        }
    }

    onInputChange(event) {
        this.setState({ inputText: event.target.value })
    }

    onSubmit(event) {
        console.log('submitted in ObjectTableCell')
        event.preventDefault();
        this.setState({ inputText: "" })
        this.props.onSubmit(parseInt(this.state.inputText), this.state.objectCategory)
    }

    createOverlay() {
        return (
            <Popover>
                <Popover.Title as="h3">Add {this.props.objectCategory}</Popover.Title>
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