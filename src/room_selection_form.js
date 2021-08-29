import React from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

const activitiesToRoomsObjects = require('./data/activity_to_rooms_objects.json')

export default class RoomForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            submitted: false,
            selectedCheckboxes: {}
        }
    }

    onChange(event) {
        let label = event.target.value
        let updatedSelectedCheckboxes = this.state.selectedCheckboxes 
        if (label in updatedSelectedCheckboxes) {
            delete updatedSelectedCheckboxes[label]
        } else {
            updatedSelectedCheckboxes[label] = null
        }
        this.setState({ selectedCheckboxes: updatedSelectedCheckboxes })
    }

    submitForm(event) {
        event.preventDefault();
        this.setState({submitted: true})
        window.sessionStorage.setItem("room", JSON.stringify(this.state.selectedCheckboxes))
        this.props.onSubmit(this.state.selectedCheckboxes);

        // return false 
    }

    render() {
        // let rooms = Object.keys(activitiesToRoomsObjects[this.props.activityName])
        let rooms
        if (this.props.activityName.length === 0) {
            rooms = ["bedroom"]
        } else {
            rooms = Object.keys(activitiesToRoomsObjects[this.props.activityName])
        }
        return(
            <div>
                <Form
                    onChange={event => this.onChange(event)}
                    onSubmit={event => {this.submitForm(event)}}
                >
                    <div>
                        {rooms.map((roomType) => (
                            <Form.Check
                                type="checkbox"
                                id={`${roomType}-checkbox`}
                                label={roomType}
                                inline 
                                value={roomType}
                                disabled={this.state.submitted}
                                // style={{ "font-weight": "bold" }}
                            />
                        ))}
                    </div>
                    <Button 
                        size="sm" 
                        type="submit" 
                        variant="outline-primary"
                        disabled={(Object.keys(this.state.selectedCheckboxes).length === 0) || this.state.submitted === true}
                        style={{ "marginTop": "10px" }}
                        // onClick={this.onSubmit}
                    >
                        submit
                    </Button>
                </Form>
            </div>
        )
    }
}

