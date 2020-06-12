import React, { Component } from 'react'
import { Card, InputGroup, Form, FormControl, Dropdown, Button,  DropdownButton, Collapse } from 'react-bootstrap'
import PubSub from 'pubsub-js'

import { getNode, createNode, updateNode, deleteNode } from './neo4j'


export default class Project extends Component {
    constructor(props) {
        super(props)

        this.state = {
            id: "04", // current node id
            name: "Confluencer",
            link: "http://141.30.193.118:8090/x/CIGf",

            hide: {
                create: (typeof this.props.node !== 'undefined'),
                update: (typeof this.props.node === 'undefined'),
                delete: (typeof this.props.node === 'undefined'),
            },
        }

        if (this.props.node) {getNode(this, this.props.node)} // get current node properties (for manipulator)
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
        // console.log("handleCreate", this.state)
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
        setTimeout(() => {
            setTimeout(() => PubSub.publish('graph', {"do": "reload", "use": ""}), 1000)
            PubSub.publish('creator', {"do": "update", "use": ""})
            PubSub.publish('manipulator', {"do": "update", "use": ""})
        }, 1000)
    }

    handleUpdate() {
        // console.log("handleUpdate", this.state)
        const node = {
            id: this.state.id, // current node id
            name: this.state.name,
            link: this.state.link,
        }
        updateNode(node)
        setTimeout(() => {
            PubSub.publish('graph', {"do": "reload", "use": ""})
            getNode(this, this.props.node)
        }, 1000)
    }

    handleDelete() {
        // console.log("handleDelete", this.state)
        deleteNode(this.state.id)
        setTimeout(() => {
            PubSub.publish('graph', {"do": "reload", "use": ""})
            PubSub.publish('manipulator', {"do": "update", "use": ""})
        }, 1000)
    }

    shouldComponentUpdate(nextProps, nextState) {
        // console.log("shouldComponentUpdate", this.props, nextProps)
        // get current node properties (for manipulator)
        if (nextProps.node && nextProps.node !== this.props.node) {
            getNode(this, nextProps.node)
            return false
        }
        return true
    }
     
    render() {
        // console.log("render project")
        const lineHeight = "30px"
        return (
            <div>
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
                
                <Button className="float-right m-2" variant="secondary" hidden={this.state.hide.create}onClick={this.handleCreate.bind(this)}>Create</Button>
                <Button className="float-right m-2" variant="secondary" hidden={this.state.hide.update} onClick={this.handleUpdate.bind(this)}>Update</Button>
                <Button className="float-left m-2" variant="secondary" hidden={this.state.hide.delete} onClick={this.handleDelete.bind(this)}>Delete</Button>
            </div>
        )
    }
}