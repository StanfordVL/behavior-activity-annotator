import React from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import Table from 'react-bootstrap/Table'

const objectData = require('./scene_objects.json')


export default class SceneObjectTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            objectRows: 6,
            selectedObjects: [],
            singleSelectedObjects: {},
            categorySelectedValues: objectData.sceneObjects.reduce((map, sceneObj) => {
                map[sceneObj] = "";
                return map;
            }, {}),
            buttonDisables: objectData.sceneObjects.reduce((map, sceneObj) => {
                map[sceneObj] = true;
                return map;
            }, {})
        }
        this.createObjectTable = this.createObjectTable.bind(this);
        this.createObjectTableCellValue = this.createObjectTableCellValue.bind(this);
        this.createObjectTableCell = this.createObjectTableCell.bind(this);
        this.updateSelectedObjects = this.updateSelectedObjects.bind(this);
        this.clearSingleSelectedObjectValue = this.clearSingleSelectedObjectValue.bind(this);
        console.log('CAT SELECTED VALUES', this.state.categorySelectedValues)
    }

    createObjectTable(objectArray) {
        var rows = this.state.objectRows;
        let cols = Math.ceil(objectArray.length / rows);
        return (
            <Table striped bordered reponsive>
                <tbody>
                    {Array.from({ length: this.state.objectRows }).map((_, r) => (
                        <tr key={r}>
                            {Array.from({ length: cols }).map((_, c) => (
                                this.createObjectTableCell(objectArray, r, c, cols)
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        )
    }

    createObjectTableCell(objectArray, r, c, cols) {
        let cellValue = this.createObjectTableCellValue(objectArray, r, c, cols);
        return(
            <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={
                    // TODO make the hiding work <Popover id="add-object-popover" onHide={() => this.state.clearSingleSelectedObjectValue(cellValue)}>
                    <Popover id="add-object-popover">
                        <Popover.Title as="h3">
                            add {this.createObjectTableCellValue(objectArray, r, c, cols)}
                        </Popover.Title>
                        <Popover.Content>
                            how many do you want? {
                                // <Form onChange={this.handleObjectAddChange}>
                                <Form 
                                    // onChange={(event) => {this.setState({singleSelectedObjects: event.target.value}); }}
                                    onChange={(event) => {
                                        this.updateSingleSelectedObjects(cellValue, event.target.value);
                                        // this.state.categorySelectedValues[cellValue] = event.target.value;
                                        // this.state.buttonDisables[cellValue] = event.target.value.length == 0
                                        // console.log(this.state.categorySelectedValues);
                                        // TODO disable button when no entry 
                                    }}
                                    onSubmit={(event) => {
                                        event.preventDefault(); 
                                        let newSelectedObjects = this.state.selectedObjects;
                                        this.updateSelectedObjects(cellValue, this.state.selectedObject);
                                        this.setState({selectedObjects: newSelectedObjects});
                                        this.props.onObjectSelect(this.state.selectedObjects);
                                    }}
                                > 
                                    <Form.Control type='text'/>
                                    <Button 
                                        variant="outline-dark" 
                                        size="sm"
                                        type="submit"
                                        // disabled={this.state.buttonDisables[cellValue]}
                                        // onClick={(event) => {this.setState({selectedObjects: this.state.selectedObjects.push(this.state.selectedObject)}); console.log(this.state)}}
                                    >
                                        add
                                    </Button>
                                </Form>
                            }
                        </Popover.Content>
                    </Popover>
                }
            >
                <td key={c}>
                    {this.createObjectTableCellValue(objectArray, r, c, cols)}
                </td>
            </OverlayTrigger>
        )
    }

    clearSingleSelectedObjectValue(object) {
        this.state.singleSelectedObjects[object] = 0;
        console.log('FROM RESET FUNCTION:', this.state.singleSelectedObjects)
    }

    updateSelectedObjects(object) {
        if (object in this.state.selectedObjects) {
            this.state.selectedObjects[object] += this.state.singleSelectedObjects[object]
        } else {
            this.state.selectedObjects[object] = this.state.singleSelectedObjects[object]
        }
    }

    updateSingleSelectedObjects(object, number) {
        this.state.singleSelectedObjects[object] = parseInt(number);
    }

    createObjectTableCellValue(objectArray, r, c, cols) {
        let numObjects = objectArray.length;
        let objectIndex = (cols * r) + c;
        var cellValue;
        if (objectIndex < numObjects) {
            cellValue = objectArray[objectIndex];
        } else {
            cellValue = '';
        }
        return (cellValue);
    }

    render() {
        return (this.createObjectTable(objectData.sceneObjects))
    }
}