import React from 'react'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'


export default class SelectedObjectsList extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props.selectedObjects)
        this.state = {
            allSelectedObjects: this.props.selectedObjects
        }
        this.createSingleCategoryList = this.createSingleCategoryList.bind(this);
    }

    createSingleCategoryList(category, i) {
        console.log(this.props.selectedObjects)
        return (
            <ListGroup.Item key={i}>
                <ButtonGroup key={i}>
                    {(() => {
                        if (this.props.selectedObjects[category] !== 0) {
                            return <Button variant="secondary">{category}</Button>
                        }
                    })()}
                    {Array.from(
                        {length: this.props.selectedObjects[category]}).map((_, j) => (
                        <Button key={j} variant="light" onClick={() => this.handleInstanceButtonClick(category)}>
                            {category}{j + 1}
                        </Button>
                    ))}
                </ButtonGroup>
            </ListGroup.Item>
        )
    }

    handleInstanceButtonClick(category) {
        console.log(category)
        console.log(this.props.selectedObjects);
        let selectedObjects = this.props.selectedObjects;
        selectedObjects[category] -= 1
        this.props.onObjectDelete(this.props.selectedObjects) 
    }

    // handle

    render() {
        return(
            <Card>
                <Card.Body>
                    <Card.Title>Your selected objects</Card.Title>
                    <Card.Text style={{fontSize: 13}} className="text-muted">
                        Click a numbered object instance to delete (this will shift the numbers so there aren't any skipped numbers). Click a category to delete all instances from that category.
                    </Card.Text>
                    <ListGroup>
                        {Object.keys(this.props.selectedObjects).map((category, i) => (
                            this.createSingleCategoryList(category, i)
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>
        )
    }
}