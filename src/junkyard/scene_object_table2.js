import React from 'react'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import ObjectSelector from './object_selection_popover';


const objectData = require('./scene_objects.json')


export default class SceneObjectTable2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            objectRows: 6,
            selectedObjects: {}
        }

        this.getObjectCategory = this.getObjectCategory.bind(this);
        this.createObjectTable = this.createObjectTable.bind(this);
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

    onObjectSubmit(numObjects, objectCategory) {
        console.log('CHILD SUBMIT FIRED', numObjects, objectCategory)
        let newSelectedObjects = {...this.state.selectedObjects};
        if (objectCategory in this.state.selectedObjects) {
            newSelectedObjects[objectCategory] += numObjects;
        } else {
            newSelectedObjects[objectCategory] = numObjects;
        }
        this.setState({ selectedObjects: newSelectedObjects });
        console.log(this.state.selectedObjects)
        this.props.onObjectSubmit(this.state.selectedObjects)
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
                                />
                            ))}
                        </tr>
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

    handleInputChange(event) {
        this.setState({ inputText: event.target.value })
    }

    onSubmit(event) {
        console.log('submitted!')
        event.preventDefault();
        console.log(this.state);
        this.props.onSubmit(parseInt(this.state.inputText), this.state.objectCategory);
    }

    render() {
        return (
            <OverlayTrigger
                trigger="click"
                placement="bottom"
                // overlay={<ObjectSelector categoryLabel={this.props.objectCategory}/>}
                overlay={
                    // <ObjectSelector objectCategory={this.props.objectCategory}/>
                    <Popover>
                        <Popover.Title as="h3">
                            Add {this.props.objectCategory}
                        </Popover.Title>
                        <Popover.Content>
                            how many do you want?
                            <Form
                                onChange={(event) => this.handleInputChange(event)}
                                onSubmit={(event) => this.onSubmit(event)}
                            >
                                <Form.Control type="number"/>
                                <Button
                                    disabled={this.state.inputText.length == 0}
                                    onClick={this.handleOnClick}
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
                <td key={this.props.key}>
                    {this.props.objectCategory}
                </td>
            </OverlayTrigger>
        )
    }
}