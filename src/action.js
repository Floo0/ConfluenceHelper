import React, { PureComponent } from 'react'
import {Card, InputGroup, Form, FormControl, Dropdown, Button,  DropdownButton, Collapse} from 'react-bootstrap'
import PubSub from 'pubsub-js'

import { createNode } from './neo4j'


export default class Action extends PureComponent {
    constructor(props) {
        super(props)

        this.categories = ["Orange", "Banana"]

        this.state = {
            name: "Unicorn",
            link: "https://www.youtube.com/watch?v=YbYWhdLO43Q",
            category: this.categories[0],
        }
    }


    renderCategoryDropdown() {
        var items = []
        var i = 0
        for (let category of this.categories.sort()) {
            items.push(<Dropdown.Item  key={i} eventKey={category}>{category}</Dropdown.Item>)
            i++
        }
        // add remove option
        items.push(<Dropdown.Divider key={i}/>)
        items.push(<Dropdown.Item key={i+1} href="#">Remove</Dropdown.Item>)
        return items
    }

    handleClickHeader() {
        this.setState({collapse: !this.state.collapse})
    }

    handleNameChange(event) {
        if (event.target.value === "") {
            this.setState({name: event.target.placeholder})
        } else {
            this.setState({name: event.target.value})
        }
    }

    handleLinkChange(event) {
        if (event.target.value === "") {
            this.setState({link: event.target.placeholder})
        } else {
            this.setState({link: event.target.value})
        }
    }

    handleSelectCategory(category) {
        this.setState({category: category})
    }

    handleCreate() {
        console.log("handleCreate", this.state)
        const node = {
            'Name': this.state.name,
            // 'Category': this.state.category,
            'Link': this.state.link
        }
        const links = [
            {
                'Target': this.state.category,
                'Type': 'part'
            }
        ]
        createNode(node, links)
        setTimeout(() => PubSub.publish('graph', {"do": "reload", "use": ""}), 500)
    }
     
    render() {
        // console.log("render action")
        return (
            <div>
                <Card style={{border: "#d8cebc solid 2px"}}>
                    <Card.Header onClick={this.handleClickHeader.bind(this)} style={{height: "63px"}}>
                        <h5 style={{marginTop: "7px"}}>Create New Node</h5>
                    </Card.Header>
                    <Collapse in={!this.state.collapse} className={"p-0"}>
                        <Card.Body>
                            {/* <Card.Title>Create New Node</Card.Title> */}
                            <InputGroup className="mb-6 p-1">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="basic-addon1">Node Name</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl
                                    placeholder={this.state.name}
                                    // aria-label="Username"
                                    // aria-describedby="basic-addon1"
                                    onChange={this.handleNameChange.bind(this)}
                                />
                            </InputGroup>
                            <InputGroup className="mb-6 p-1">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="basic-addon1">Link</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl
                                    placeholder={this.state.link}
                                    // aria-label="Username"
                                    // aria-describedby="basic-addon1"
                                    onChange={this.handleLinkChange.bind(this)}
                                />
                            </InputGroup>
                            <InputGroup className="mb-6 p-1">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="basic-addon1">Category</InputGroup.Text>
                                </InputGroup.Prepend>
                                <DropdownButton
                                    // as={InputGroup.Prepend}
                                    variant="outline-secondary"
                                    title={this.state.category}
                                    id="input-group-dropdown-1"
                                    onSelect={this.handleSelectCategory.bind(this)}
                                >
                                    {this.renderCategoryDropdown.call(this)}                                   
                                </DropdownButton>
                            </InputGroup>
                            <Button className="float-right" variant="secondary" onClick={this.handleCreate.bind(this)}>Create</Button>
                        </Card.Body>
                    </Collapse>
                </Card>
            </div>
        )
    }
}