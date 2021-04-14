import React from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import { allActivities, igibsonGcpVmSetupUrl } from './constants.js'

const activityToPreselectedScene = require("./data/activity_to_preselected_scenes.json")

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
        console.log("Hit onSubmit")
        event.preventDefault()
        if (allActivities.includes(this.state.activityName)) {
            this.setState({ submitted: true })
            window.sessionStorage.setItem("activityName", JSON.stringify(this.state.activityName))
            this.props.onSubmit(this.state.activityName)

            console.log("PRESELECTED SCENES:", activityToPreselectedScene[this.state.activityName])
            try {
                const envsPostRequest = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(activityToPreselectedScene[this.state.activityName])
                }
                fetch(igibsonGcpVmSetupUrl, envsPostRequest)
                .then(response => response.json()) 
                .then(data => {
                    console.log("DONE!")
                    window.sessionStorage.setItem("uuids", JSON.stringify(data["uuids"]))
                    window.sessionStorage.setItem("simulatorsReady", JSON.stringify(true))
                })
            } catch (error) {
                // TODO report the error to the annotator 
            } finally {

            }
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