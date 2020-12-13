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

    updateSelectedNumber(event) {
        this.setState({ inputText: event.target.value })
    }

    render() {
        return (
            <Popover>
                <Popover.Title as="h3">
                    Add {this.props.categoryLabel}
                </Popover.Title>
                <Popover.Content>
                    how many do you want?
                    <Form
                        onChange={(event) => this.updateSelectedNumber(event)}
                    >
                        
                    </Form>

                    <input 
                        type="number" 
                        onChange={this.handleOnChange}
                        value={this.state.inputText}
                    />
                    <Button 
                        disabled={this.state.inputText.length > 0}
                        onClick={this.handleOnClick}
                    >add</Button>
                </Popover.Content>
            </Popover>
        )
    }
}