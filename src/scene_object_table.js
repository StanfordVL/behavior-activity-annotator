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
            objectRows: 6
        }
        this.createObjectTable = this.createObjectTable.bind(this);
        this.createObjectTableCellValue = this.createObjectTableCellValue.bind(this);
        this.selectedObjects = [];
        this.createObjectTableCell = this.createObjectTableCell.bind(this);
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
        return(
            <OverlayTrigger
                trigger="click"
                placement="right"
                overlay={
                    <Popover id="add-object-popover">
                        <Popover.Title as="h3">
                            add {this.createObjectTableCellValue(objectArray, r, c, cols)}
                        </Popover.Title>
                        <Popover.Content>
                            how many do you want? {
                                <Form>
                                    <Form.Control type='text' placeholder='0'/>
                                    <Button 
                                        variant="outline-dark" 
                                        size="sm"
                                        onClick={function() {console.log('clicked add!')}}
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