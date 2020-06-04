import React, { PureComponent } from 'react'
import { Card, InputGroup, Form, FormControl, Dropdown, Button,  DropdownButton, Collapse } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import PubSub from 'pubsub-js'

import { createNode } from './neo4j'


export default class ProjectCreator extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            name: "Confluencer",
            link: "http://141.30.193.118:8090/x/CIGf",
        }
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

    handleCreate() {
        console.log("handleCreate", this.state)
        const node = {
            'Name': this.state.name,
            'Link': this.state.link
        }
        const links = [
            // {
            //     'Target': this.state.category,
            //     'Type': 'part'
            // }
        ]
        createNode("project", node, links)
        setTimeout(() => PubSub.publish('graph', {"do": "reload", "use": ""}), 500)
    }
     
    render() {
        // console.log("render action")
        const lineHeight = "30px"
        return (
            <Card.Body>
                <InputGroup className="mb-6 p-1 h-25">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}}> Name</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        placeholder={this.state.name}
                        // aria-label="Username"
                        // aria-describedby="basic-addon1"
                        onChange={this.handleNameChange.bind(this)}
                    />
                </InputGroup>

                <InputGroup className="p-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}}>Link</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        placeholder={this.state.link}
                        // aria-label="Username"
                        // aria-describedby="basic-addon1"
                        onChange={this.handleLinkChange.bind(this)}
                    />
                </InputGroup>
                <Button className="float-right mt-2" variant="secondary" onClick={this.handleCreate.bind(this)}>Create</Button>
            </Card.Body>
        )
    }
}