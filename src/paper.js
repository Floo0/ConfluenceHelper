import React, { Component } from 'react'
import { Card, InputGroup, Form, FormControl, Dropdown, Button,  DropdownButton, Collapse } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import PubSub from 'pubsub-js'

import { getNodes, getNode, createNode, updateNode, deleteNode } from './neo4j'


export default class Paper extends Component {
    constructor(props) {
        super(props)

        this.categories = ["banana","carrot"]

        this.state = {
            id: "05", // current node id
            name: "Unicorn Paper",
            link: "http://141.30.193.118:8090/x/FYGf",
            creation: new Date(),
            update: new Date(),
            short: "Zusammenfassung und Übersicht zu typischen Teilgebieten der Informationstheorie.",
            parents: [],  // current parent relations

            options: [], // used for potential parent relations
            hide: {
                create: (typeof this.props.node !== 'undefined'),
                update: (typeof this.props.node === 'undefined'),
                delete: (typeof this.props.node === 'undefined'),
            },
        }

        getNodes(this)
        if (this.props.node) {getNode(this, this.props.node)} // get current node properties (in manipulator)
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
    handleParentsChange(event){
        // console.log("handleNodesChange", event)
        this.setState({parents: event})
    }
    handleShortChange(event) {
        if (event.target.value === "") {
            this.setState({short: event.target.placeholder})
        } else {
            this.setState({short: event.target.value})
        }
    }

    handleCreate() {
        // console.log("handleCreate", this.state)
        const node = {
            'Name': this.state.name,
            'Link': this.state.link,
            'Creation': this.state.creation,
            'Update': this.state.update,
            'Short': this.state.short, 
        }
        var links = []
        for (const parent of this.state.parents) {
            links.push(parent.value)
        }
        createNode('paper', node, links)
        setTimeout(() => {
            setTimeout(() => PubSub.publish('graph', {"do": "reload", "use": ""}), 1000)
            PubSub.publish('creator', {"do": "update", "use": ""})
            PubSub.publish('manipulator', {"do": "update", "use": ""})
        }, 1000)
    }
    
    handleUpdate() {
        // console.log("handleUpdate", this.state)
        var parents = []
        for (const parent of this.state.parents) {
            parents.push(parent.value)
        }
        // https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript
        const createParents = parents.filter(x => !this.state.oldParents.includes(x))
        const deleteParents = this.state.oldParents.filter(x => !parents.includes(x))
        // console.log("parents:", parents, this.state.oldParents, createParents, deleteParents)
     
        const node = {
            id: this.state.id, // current node id
            name: this.state.name,
            link: this.state.link,
            creation: this.state.creation,
            update: this.state.update,
            short: this.state.short,
            createParents: createParents,
            deleteParents: deleteParents,
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
        // console.log("render paper", this.state)
        return (
            <div>
                <InputGroup className="mb-6 p-1 pt-2">
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

                <InputGroup className="mb-6 p-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}} className="p-1">Creation</InputGroup.Text>
                    </InputGroup.Prepend>
                    <DatePicker
                        className="p-1"
                        selected={this.state.creation}
                        onChange={(date) => {this.setState({creation: date})}}
                        showPopperArrow={false}
                        dateFormat="dd. MMMM, yyyy"
                    />
                </InputGroup>

                <InputGroup className="mb-6 p-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}} className="p-1">Update</InputGroup.Text>
                    </InputGroup.Prepend>
                    <DatePicker
                        className="p-1"
                        selected={this.state.update}
                        onChange={(date) => {this.setState({update: date})}}
                        showPopperArrow={false}
                        dateFormat="dd. MMMM, yyyy"
                    />
                </InputGroup>

                <InputGroup className="p-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}} className="p-1">Parents</InputGroup.Text>
                    </InputGroup.Prepend>
                    <div style={{width: '300px'}}>
                        <Select
                            isMulti
                            closeMenuOnSelect={false}
                            value={this.state.parents}
                            options={this.state.options}
                            onChange={this.handleParentsChange.bind(this)}
                        />
                    </div>
                </InputGroup>

                <InputGroup className="p-1 pb-2">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}} className="p-1">Short</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        placeholder={this.state.short}
                        as="textarea"
                        // aria-label="With textarea"
                        onChange={this.handleShortChange.bind(this)}
                    />
                </InputGroup>

                <Button className="float-right m-2" variant="secondary" hidden={this.state.hide.create}onClick={this.handleCreate.bind(this)}>Create</Button>
                <Button className="float-right m-2" variant="secondary" hidden={this.state.hide.update} onClick={this.handleUpdate.bind(this)}>Update</Button>
                <Button className="float-left m-2" variant="secondary" hidden={this.state.hide.delete} onClick={this.handleDelete.bind(this)}>Delete</Button>
            </div>
        )
    }
}