import React from 'react';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Popover from 'react-bootstrap/Popover';


export default class ObjectSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputText: ""
        }
    }

    handleOnChange(event) {
        this.setState({ inputText: event.target.value })
    }

    handleOnClick() {
        this.props.onClick(parseInt(this.state.inputText))
    }

    handleInputChange(event) {
        this.setState({ inputText: event.target.value })
    }

    handleSubmit(event) {
        console.log('submitted!')
        event.preventDefault();
    }

    render() {
        return (
            <Popover>
                <Popover.Title as="h3">
                    Add {this.props.objectCategory}
                </Popover.Title>
                <Popover.Content>
                    how many do you want?
                    <Form
                        onChange={(event) => this.handleInputChange(event)}
                        onSubmit={(event) => this.handleSubmit(event)}
                    >
                        <Form.Control type="number"/>
                        <Button
                            disabled={this.state.inputText.length == 0}
                            onClick={this.handleOnClick}
                            variant="outline-dark" 
                            size="sm"
                            type="submit"
                        >
                            add
                        </Button>
                    </Form>
                </Popover.Content>
            </Popover>
        )
    }
}