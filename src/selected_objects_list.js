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
        this.handleSelectionButtonClick = this.handleSelectionButtonClick.bind(this);
    }

    createSingleCategoryList(category, i) {
        console.log(this.props.selectedObjects)
        return (
            <ButtonGroup key={i}>
                {(() => {
                    if (this.props.selectedObjects[category] !== 0) {
                        return <Button variant="secondary">{category}</Button>
                    }
                })()}
                {Array.from(
                    {length: this.props.selectedObjects[category]}).map((_, j) => (
                    <Button key={j} variant="light" onClick={() => this.handleSelectionButtonClick(category)}>
                        {category}{j + 1}
                    </Button>
                ))}
            </ButtonGroup>
        )
    }

    handleSelectionButtonClick(category) {
        console.log(category)
        console.log(this.props.selectedObjects);
        // TODO delete selected objects 
    }

    render() {
        return(
            <Card>
                <Card.Body>
                    <Card.Title>Your selected objects</Card.Title>
                    <Card.Text style={{fontSize: 13}} className="text-muted">
                        Click a numbered object instance to delete (this will shift the numbers so there aren't any skipped numbers). Click a category to delete all instances from that category.
                    </Card.Text>
                    {Object.keys(this.props.selectedObjects).map((category, i) => (
                        this.createSingleCategoryList(category, i)
                    ))}
                </Card.Body>
            </Card>
        )
    }
}