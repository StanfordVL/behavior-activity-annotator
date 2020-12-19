import React from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'


export default class RoomForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            submitted: false,
            // selectedCheckboxes: new Set()
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
        console.log(this.state.selectedCheckboxes)
    }

    onSubmit(event) {
        event.preventDefault();
        this.setState({ submitted: true, selectedCheckboxes: 5 })
        // this.setState({ selectedCheckboxes: 5 })

        console.log('CHOSEN ROOMS:', this.state.selectedCheckboxes)
        this.props.onSubmit(this.state.selectedCheckboxes);
    }

    render() {
        return(
            <div>
                <Form
                    onChange={(event) => this.onChange(event)}
                    onSubmit={(event) => this.onSubmit(event)}
                >
                    <div>
                        {['kitchen', 'bedroom', 'bathroom', 'living room', 'garage'].map((roomType) => (
                            <Form.Check
                                type="checkbox"
                                id={`${roomType}-checkbox`}
                                label={roomType}
                                inline 
                                value={roomType}
                                disabled={this.state.submitted}
                            />
                        ))}
                    </div>
                    <Button 
                        size="sm" 
                        type="submit" 
                        variant="outline-dark"
                        disabled={(this.state.selectedCheckboxes.size === 0) || this.state.submitted === true}
                    >
                        submit
                    </Button>
                </Form>
            </div>
        )
    }
}

