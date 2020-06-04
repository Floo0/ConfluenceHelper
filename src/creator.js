import React, { PureComponent } from 'react'
import { Card, InputGroup, Form, FormControl, Dropdown, Button,  DropdownButton, Collapse } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import PubSub from 'pubsub-js'

import { createNode } from './neo4j'
import KnowledgeCreator from './knowledge_creator'
import ProjectCreator from './project_creator'
import EditorCreator from './editor_creator'



export default class Creator extends PureComponent {
    constructor(props) {
        super(props)

        this.types = ["Knowledge", "Project", "Editor"]

        this.state = {
            type: "Knowledge",
            // title: "Banana",
            // editor: "Unicorn",
            // project: "Rainbow",
            // link: "https://www.youtube.com/watch?v=YbYWhdLO43Q",
            // category: this.categories[0],
        }
    }


    handleClickHeader() {
        this.setState({collapse: !this.state.collapse})
    }

    // handleTitleChange(event) {
    //     if (event.target.value === "") {
    //         this.setState({title: event.target.placeholder})
    //     } else {
    //         this.setState({title: event.target.value})
    //     }
    // }

    // handleEditorChange(event) {
    //     if (event.target.value === "") {
    //         this.setState({editor: event.target.placeholder})
    //     } else {
    //         this.setState({editor: event.target.value})
    //     }
    // }

    // handleProjectChange(event) {
    //     if (event.target.value === "") {
    //         this.setState({project: event.target.placeholder})
    //     } else {
    //         this.setState({project: event.target.value})
    //     }
    // }

    // handleLinkChange(event) {
    //     if (event.target.value === "") {
    //         this.setState({link: event.target.placeholder})
    //     } else {
    //         this.setState({link: event.target.value})
    //     }
    // }

    // handleSelectCategory(category) {
    //     this.setState({category: category})
    // }

    handleSelectType(value) {
        this.setState({type: value})
    }


    // handleCreate() {
    //     console.log("handleCreate", this.state)
    //     const node = {
    //         'Name': this.state.title,
    //         // 'Category': this.state.category,
    //         'Link': this.state.link
    //     }
    //     const links = [
    //         {
    //             'Target': this.state.category,
    //             'Type': 'part'
    //         }
    //     ]
    //     createNode(node, links)
    //     setTimeout(() => PubSub.publish('graph', {"do": "reload", "use": ""}), 500)
    // }
    
    // renderCategoryDropdown() {
    //     var items = []
    //     var i = 0
    //     for (let category of this.categories.sort()) {
    //         items.push(<Dropdown.Item  key={i} eventKey={category}>{category}</Dropdown.Item>)
    //         i++
    //     }
    //     // add remove option
    //     items.push(<Dropdown.Divider key={i}/>)
    //     items.push(<Dropdown.Item key={i+1} href="#">Remove</Dropdown.Item>)
    //     return items
    // }

    renderTypeDropdown() {
        var items = []
        var i = 0
        for (let type of this.types.sort()) {
            items.push(<Dropdown.Item  key={i} eventKey={type}>{type}</Dropdown.Item>)
            i++
        }
        return items
    }

    renderInput() {
        // console.log("renderInput:", this)
        switch (this.state.type) {
            case "Knowledge":
                return <KnowledgeCreator/>
            case "Project":
                return <ProjectCreator/>
            case "Editor":
                return <EditorCreator/>
        }
    }
     
    render() {
        // console.log("render action")
        const lineHeight = "30px"
        return (
            <div>
                <Card style={{border: "#d8cebc solid 2px"}}>
                    <Card.Header onClick={this.handleClickHeader.bind(this)} style={{height: "63px"}}>
                        <h5 style={{marginTop: "7px", float: "left", minWidth: "300px"}}>Create New Node</h5>
                        <DropdownButton  className="float-right" 
                            variant="secondary"
                            title={this.state.type}
                            id="input-group-dropdown-1"
                            onSelect={this.handleSelectType.bind(this)}
                        >
                            {this.renderTypeDropdown.call(this)}                                   
                        </DropdownButton>
                    </Card.Header>
                    <Collapse in={!this.state.collapse} className={"p-0"}>
                    {this.renderInput()}
                    </Collapse>
                </Card>
            </div>
        )
    }
}