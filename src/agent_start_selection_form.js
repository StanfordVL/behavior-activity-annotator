import React from "react"
import { Card } from "react-bootstrap"
import Form from "react-bootstrap/Form"

export default class AgentStartForm extends React.Component {
    constructor(props) {
        super(props)
    }

    onChange(event) {
        this.props.onAgentStartSelection(event.target.value)
    }

    constructForm() {
        let selectedRooms = Object.keys(JSON.parse(window.sessionStorage.getItem("room")))
        // if (selectedRooms.length != 1) {
        return (
            <Card className="marginCard">
                <Card.Body>
                    <Card.Title as="h4">Agent start location</Card.Title>
                    <Card.Text>
                        Since you have selected multiple rooms, please let us know where 
                            the agent should start. For example, if the activity is "serving
                            a meal", you might have a "kitchen" and a "dining_room", and 
                            "kitchen" might be the more sensible starting point. It's up to you!
                    </Card.Text>
                    <Form
                        onChange={event => this.onChange(event)}
                    >
                        <Form.Group>
                            {selectedRooms.map((room) => (
                                <div key={`default-${room}`} className="mb-3">
                                    <Form.Check
                                        type="radio"
                                        id={room}
                                        label={room}
                                        value={room}
                                        inline
                                        name="agent-start-room"
                                    />
                                </div>
                            ))}
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        )
        // } else {
        //     return (<div/>)
        // }
    }

    render() {
        return (
            <div>
                {this.constructForm()}
            </div>
        )
    }
}