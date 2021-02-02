import React from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

export default class NameEntryForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = { annotatorName: "", submitted: false }
    }

    onChange(event) {
        this.setState({ annotatorName: event.target.value })
    }

    onSubmit(event) {
        event.preventDefault()
        window.sessionStorage.setItem('annotatorName', JSON.stringify(this.state.annotatorName))
        this.setState({ submitted: true })
        this.props.onSubmit()
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
                        placeholder="Please enter your first name"
                        // className="marginCard"
                        style={{ marginBottom: "10px" }}
                        disabled={this.state.submitted}
                    />
                    <Button
                        variant="outline-primary"
                        size="sm"
                        type="submit"
                        disabled={this.state.annotatorName.length === 0 || this.state.submitted}
                        className="marginCard"
                    >
                        Submit
                    </Button>
                </Form>
            </div>
        )
    }
}