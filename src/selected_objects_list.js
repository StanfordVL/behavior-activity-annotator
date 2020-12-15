import React from 'react'
import ListGroup from 'react-bootstrap/ListGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/esm/Card';


export default class SelectedObjectsList extends React.Component {
    constructor(props) {
        super(props);
    }

    createSingleCategoryList(category, i) {
        return (

            (() => {
                if (this.props.selectedObjects[category] != 0) {
                    return (
                        <ListGroup.Item key={i}>
                            <ButtonGroup>
                                <Button variant="secondary" onClick={() => this.handleCategoryButtonClick(category)}>
                                    {category}
                                </Button>
                            </ButtonGroup>
                            {Array.from({length: this.props.selectedObjects[category]}).map((_, j) => (
                                <Button key={j} variant="light" onClick={() => this.handleInstanceButtonClick(category)}>
                                    {category}{j + 1}
                                </Button>
                            ))}
                        </ListGroup.Item>
                    )
                }
            })()
        )
    }

    handleInstanceButtonClick(category) {
        this.props.onObjectDelete(-1, category)
    }

    handleCategoryButtonClick(category) {
        this.props.onObjectDelete(-1 * this.props.selectedObjects[category], category)
    }

    render() {
        return (
            <Card>
                <Card.Body>
                    <Card.Title>Your selected objects</Card.Title>
                    <Card.Text style={{fontSize: 13}} className="text-muted">
                        Click a numbered object instance to delete (this will shift the numbers so there aren't any skipped numbers). Click a category to delete all instances of that category.
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