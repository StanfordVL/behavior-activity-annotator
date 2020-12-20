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
                        {['kitchen', 'bedroom', 'bathroom', 'living room', 'garage', 'dining room'].map((roomType) => (
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
                        variant="outline-dark"
                        disabled={(Object.keys(this.state.selectedCheckboxes).length === 0) || this.state.submitted === true}
                        style={{ "marginTop": "10px" }}
                    >
                        submit
                    </Button>
                </Form>
            </div>
        )
    }
}

