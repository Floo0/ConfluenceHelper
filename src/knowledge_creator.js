import React, { PureComponent } from 'react'
import { Card, InputGroup, Form, FormControl, Dropdown, Button,  DropdownButton, Collapse } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import PubSub from 'pubsub-js'

import { createNode } from './neo4j'


export default class KnowledgeCreator extends PureComponent {
    constructor(props) {
        super(props)

        this.categories = ["banana","carrot"]
        this.nodes = [
            { value: 'chocolate', label: 'Chocolate' },
            { value: 'strawberry', label: 'Strawberry' },
            { value: 'vanilla', label: 'Vanilla' },
          ]

        this.state = {
            name: "Unicorn Knowledge",
            link: "https://tu-dresden.de/bu/verkehr/iad/fm/die-professur/beschaeftigte",
            creation: new Date(),
            update: new Date(),
            nodes: [],

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
    handleNodesChange(event){
        console.log("handleNodesChange", event)
        this.setState({nodes: event})
    }

    handleCreate() {
        console.log("handleCreate", this.state)
        const node = {
            'Name': this.state.name,
            'Link': this.state.link
        }
        const links = [

        ]
        createNode("editor", node, links)
        setTimeout(() => PubSub.publish('graph', {"do": "reload", "use": ""}), 500)
    }
     
    render() {
        // console.log("render action")
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
                            value={this.state.nodes}
                            options={this.nodes}
                            // menuIsOpen={false}
                            onMenuClose={console.log("blubb")}
                            onChange={this.handleNodesChange.bind(this)}
                        />
                    </div>
                </InputGroup>
                {/* <InputGroup className="mb-6 p-1 h-25">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}} className="p-1"> Select Node Type:</InputGroup.Text>
                    </InputGroup.Prepend>
                    <DropdownButton
                        // size="sm"
                        // as={InputGroup.Prepend}
                        variant="outline-secondary"
                        title={this.state.category}
                        id="input-group-dropdown-1"
                        onSelect={this.handleSelectCategory.bind(this)}
                    >
                        {this.renderCategoryDropdown.call(this)}                                   
                    </DropdownButton>
                </InputGroup>

                <InputGroup className="p-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}} className="p-1">Title</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        placeholder={this.state.title}
                        // aria-label="Username"
                        // aria-describedby="basic-addon1"
                        onChange={this.handleTitleChange.bind(this)}
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
                <InputGroup className="mb-6 p-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}} className="p-1">Editor</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        
                        placeholder={this.state.editor}
                        // aria-label="Username"
                        // aria-describedby="basic-addon1"
                        onChange={this.handleEditorChange.bind(this)}
                    />
                </InputGroup>
                <InputGroup className="mb-6 p-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}} className="p-1">Project</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        
                        placeholder={this.state.project}
                        // aria-label="Username"
                        // aria-describedby="basic-addon1"
                        onChange={this.handleProjectChange.bind(this)}
                    />
                </InputGroup>
                <InputGroup className="mb-6 p-1">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}} className="p-1">Link</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                        
                        placeholder={this.state.link}
                        // aria-label="Username"
                        // aria-describedby="basic-addon1"
                        onChange={this.handleLinkChange.bind(this)}
                    />
                </InputGroup>
                <InputGroup className="mb-6 p-1 h-25">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}} className="p-1">Parent</InputGroup.Text>
                    </InputGroup.Prepend>
                    <DropdownButton
                        // size="sm"
                        // as={InputGroup.Prepend}
                        variant="outline-secondary"
                        title={this.state.category}
                        id="input-group-dropdown-1"
                        onSelect={this.handleSelectCategory.bind(this)}
                    >
                        {this.renderCategoryDropdown.call(this)}                                   
                    </DropdownButton>
                </InputGroup> */}
                <Button className="float-right" variant="secondary" onClick={this.handleCreate.bind(this)}>Create</Button>
            </Card.Body>
        )
    }
}