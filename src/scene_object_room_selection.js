import React from 'react'
import Form from 'react-bootstrap/Form'
import Figure from 'react-bootstrap/Figure'


export default class SceneObjectRoomSelection extends React.Component {
    constructor(props) {
        super(props)        // this.props.sceneObjects, this.props.rooms 

        this.genForm = this.genForm.bind(this)
    }

    genForm() {
        if (Object.keys(this.props.selectedRooms).length > 1) {
            this.buildForm()
        }
    }

    buildFormEntry(sceneObject) {
        return (
            <div>
                <Figure>
                    
                </Figure>
                
                {Object.keys(this.props.selectedRooms).map((roomType) => (
                    <Form.Check
                        type="radio"
                        id={`${roomType}-radio`}
                        label={roomType}
                        inline
                        value={roomType}
                    />
                ))}
            </div>
        )
    }

    buildForm() {
        return (
            <Form>
                
            </Form>
        )
    }

    render() {
        return (
            <div>
                {this.genForm()}
            </div>
        )
    }

}