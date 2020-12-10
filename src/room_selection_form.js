import React from 'react';
import Form from 'react-bootstrap/Form'


export default class RoomForm extends React.Component {
    render() {
        return(
            <Form>
            <div key={`room-options`} className="mb-3">
                <Form.Check
                type='checkbox'
                id={`kitchen-checkbox`}
                label={`kitchen`}
                />
                <Form.Check
                type='checkbox'
                id={`bedroom-checkbox`}
                label={`bedroom`}
                />
                <Form.Check
                type='checkbox'
                id={`bathroom-checkbox`}
                label={`bathroom`}
                />
                <Form.Check
                type='checkbox'
                id={`garage-checkbox`}
                label={`garage`}
                />
                <Form.Check
                type='checkbox'
                id={`livingroom-checkbox`}
                label={`living room`}
                />
            </div>
            </Form>
        )
    }
}

