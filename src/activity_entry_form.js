import React from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import { allActivities, igibsonGcpVmSetupUrl, ServerErrorModal } from './constants.js'
import { v4 as uuid } from "uuid"

const activityToPreselectedScene = require("./data/activity_to_preselected_scenes.json")

export default class ActivityEntryForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activityName: "",
            showErrorModal: false,
            submitted: false,
            showServerErrorMessage: false,
        }
    }

    onErrorModalHide() {
        this.setState({ showErrorModal: false })
    }

    onServerErrorMessageHide() { this.setState({ showServerErrorMessage: false }) }

    onChange(event) {
        this.setState({ activityName: event.target.value.split(' ').join('_') })
    }

    onSubmit(event) {
        event.preventDefault()
        if (allActivities.includes(this.state.activityName)) {
            this.setState({ submitted: true })
            window.sessionStorage.setItem("activityName", JSON.stringify(this.state.activityName))
            this.props.onSubmit(this.state.activityName)

            const envsPostRequest = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(activityToPreselectedScene[this.state.activityName].slice(0, 1))
                // body: JSON.stringify(activityToPreselectedScene[this.state.activityName])
            }
            fetch(igibsonGcpVmSetupUrl, envsPostRequest)
            .then(response => response.json())
            .then(data => {
                window.sessionStorage.setItem("scenes_ids", JSON.stringify(data["scenes_ids"]))
                window.sessionStorage.setItem("serverReady", JSON.stringify(true))
            })
            .catch(response => {
                const fakeIds = Array(activityToPreselectedScene[this.state.activityName].slice(0, 1).length).fill().map(() => uuid())   
                // const fakeIds = Array(activityToPreselectedScene[this.state.activityName].length).fill().map(() => uuid())   
                const newScenesIds = fakeIds.map((id, i) => [activityToPreselectedScene[this.state.activityName].slice(0, 1)[i], id])
                // const newScenesIds = fakeIds.map((id, i) => [activityToPreselectedScene[this.state.activityName][i], id])
                window.sessionStorage.setItem("scenes_ids", JSON.stringify(newScenesIds))
                window.sessionStorage.setItem("serverReady", JSON.stringify(true))
                this.setState({ showServerErrorMessage: true })
            })
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

                {/* Server error message */}
                <ServerErrorModal 
                    show={this.state.showServerErrorMessage} 
                    onHide={() => this.onServerErrorMessageHide()}
                />
            </div>
        )
    }
}
