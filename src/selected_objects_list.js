import React from 'react'
import ListGroup from 'react-bootstrap/ListGroup'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import { v4 as uuidv4 } from 'uuid'
import Popover from 'react-bootstrap/esm/Popover'


export default class SelectedObjectsList extends React.Component {
    constructor(props) {
        super(props)
    }

    createDemotedRoomsMap() {
        /**
         * Create map of pureCategory: num_instances if pureCategory == category, else {room: num_instances}
         */
        let demotedRoomsMap = {}

        for (let [category, number] of Object.entries(this.props.selectedObjects)) {
            if (category.includes(' (')) {
                let [pureCategory, room] = category.split(' (')
                room = ' (' + room
                if (!(pureCategory in demotedRoomsMap)) {
                    demotedRoomsMap[pureCategory] = {}
                } 
                demotedRoomsMap[pureCategory][room] = number
            } else {
                demotedRoomsMap[category] = number 
            }
        }
        return demotedRoomsMap
    }

    createSingleCategoryList(pureCategory) {
        let demotedRoomsMap = this.createDemotedRoomsMap()
        if (typeof demotedRoomsMap[pureCategory] === "number") {
            if (demotedRoomsMap[pureCategory] > 0) {
                return (
                    <ListGroup.Item key={uuidv4()}>
                        <ButtonGroup>
                            <Button variant="success" onClick={() => this.handleCategoryButtonClick(pureCategory)}>
                                {pureCategory}
                            </Button>
                        </ButtonGroup>
                        {Array.from({length: demotedRoomsMap[pureCategory]}).map((_, j) => (
                            <Button key={j} variant="light" onClick={() => this.handleInstanceButtonClick(pureCategory)}>
                                {pureCategory}{j + 1}
                            </Button>
                        ))}
                    </ListGroup.Item>
                )
            }
        } else {
            let startIndex = 0
            let roomsToIndices = {}
            for (let room of Object.keys(demotedRoomsMap[pureCategory]).sort()) {
                roomsToIndices[room] = Array.from({length: demotedRoomsMap[pureCategory][room]}, (_, i) => i + startIndex)
                startIndex += demotedRoomsMap[pureCategory][room]
            }
            return (
                <div>
                    {Object.keys(demotedRoomsMap[pureCategory]).sort().map((room, room_index) => (
                        (() => {
                            if (demotedRoomsMap[pureCategory][room] > 0) {
                                return (
                                    <ListGroup.Item key={uuidv4()}>
                                        <ButtonGroup>
                                            <Button variant="danger" onClick={() => this.handleCategoryButtonClick(pureCategory + room)}>
                                                {pureCategory}{room}
                                            </Button>
                                        </ButtonGroup>
                                        {roomsToIndices[room].map((instance_index, _) => (
                                            <Button key={instance_index} variant="light" onClick={() => this.handleInstanceButtonClick(pureCategory + room)}>
                                                {pureCategory}{instance_index + 1}{room}
                                            </Button>
                                        ))}
                                    </ListGroup.Item>
                                )
                            } 
                        })()
                    ))}
                </div>
            )
        }
    }

    handleInstanceButtonClick(category) {
        this.props.onObjectDelete(-1, category)
    }

    handleCategoryButtonClick(category) {
        this.props.onObjectDelete(-1 * this.props.selectedObjects[category], category)
    }

    render() {
        return (
            <Card>
                <Card.Body>
                    <Card.Title>Your selected objects list</Card.Title>
                    <Card.Text style={{ fonrtSize: 13 }} className="text-muted">
                        <p>Scene objects will show up with a red category label, and additional objects will show up with a green category label. This will help you keep them straight both here and below, when you're making conditions.</p>
                        <p>Click a numbered object instance to delete (this will shift the numbers so there aren't any skipped numbers).</p>
                    </Card.Text>
                    <ListGroup>
                        {Object.keys(this.createDemotedRoomsMap()).map((pureCategory, i) => (
                            this.createSingleCategoryList(pureCategory, i)
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>
        )
    }
}