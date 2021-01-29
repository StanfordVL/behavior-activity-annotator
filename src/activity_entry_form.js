import React from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'

// const allActivities = require('./activity_names.json')
const allActivities = Object.keys(require("./all_activity_hierarchies.json"))

export default class ActivityEntryForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activityName: "",
            showErrorModal: false,
            submitted: false
        }
    }

    onErrorModalHide() {
        this.setState({ showErrorModal: false })
    }

    onChange(event) {
        this.setState({ activityName: event.target.value.split(' ').join('_') })
    }

    onSubmit(event) {
        event.preventDefault()
        if (allActivities.includes(this.state.activityName)) {
            this.setState({ submitted: true })
            this.props.onSubmit(this.state.activityName)
        } else {
            this.setState({ showErrorModal: true })
        }
        
    }

    render() {
        return (
            <div>
                <Form 
                    onSubmit={(event) => this.onSubmit(event)}
                    onChange={(event) => this.onChange(event)}
                >
                    <Form.Control 
                        size="lg" 
                        type="text" 
                        placeholder="Copy activity name exactly" 
                        className="marginCard" 
                        disabled={this.state.submitted}
                    />
                    <Button 
                        variant="outline-primary" 
                        type="submit"
                        disabled={this.state.activityName.length === 0 || this.state.submitted}
                    >
                        Submit
                    </Button>
                </Form>
                <Modal
                    show={this.state.showErrorModal}
                    onHide={() => this.onErrorModalHide()}
                >
                    <Modal.Header closeButton/>
                    <Modal.Body>
                        Invalid activity name - please try again. Make sure all characters are lower-case and there are no spaces before or after the phrase. Thanks!
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}