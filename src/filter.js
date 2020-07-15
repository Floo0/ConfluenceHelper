import React, { PureComponent } from 'react'
import { Card, InputGroup, Form, FormControl, Dropdown, Button,  DropdownButton, Collapse } from 'react-bootstrap'
import Select from 'react-select'
import PubSub from 'pubsub-js'

import { getLabels, getNodes } from './neo4j'


export default class Filter extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            collapse: false,
            labels: [],
            selectedLabels: [
                {value: "knowledge", label: "Knowledge"},
                {value: "tool", label: "Tool"},
                {value: "paper", label: "Paper"},
            ],
            options: [],
            selectedOptions: [

            ]
        }

        this.filter = {
            // labels: ["knowledge", "tool", "paper"],
        }

        getLabels(this)
        // getNodes(this, ["editor", "project"])
        getNodes(this) // just get all nodes, there is no need to limit
    }

    handleLabelsChange(selected) {
        // console.log("handleLabelsChange:", selected)
        this.setState({selectedLabels: selected})
        var labels = []
        if (selected) {
            for (const element of selected) {
                labels.push(element.value)
            }
        }
        this.filter["labels"] = labels
        PubSub.publish('graph', {"do": "filter", "use": this.filter})
    }

    handleOptionsChange(selected) {
        // console.log("handleLabelsChange:", selected)
        this.setState({selectedOptions: selected})
        var nodes = []
        if (selected) {
            for (const element of selected) {
                nodes.push(element.value)
            }
        }
        this.filter["relatedNodes"] = nodes
        PubSub.publish('graph', {"do": "filter", "use": this.filter})
    }

    render() {
        // console.log("render manipulator")
        return (
            <div>
                <Card style={{border: "#d8cebc solid 2px"}}>
                <Card.Header onClick={() => {this.setState({collapse: !this.state.collapse})}} style={{height: "63px"}}>
                        <h5 style={{marginTop: "7px", float: "left", minWidth: "150px"}}>Filter</h5>
                    </Card.Header>
                    <Collapse in={!this.state.collapse} className={"p-0"}>
                        <Card.Body className="m-1" style={{height: window.innerHeight/1.3 - 8}}>

                        <br/>
                        <label>Types to include:</label>
                        <InputGroup className="p-1">
                            <div style={{width: '300px'}}>
                                <Select
                                    isMulti
                                    // closeMenuOnSelect={false}
                                    value={this.state.selectedLabels}
                                    options={this.state.labels}
                                    // onFocus={this.handleClickSelect.bind(this)}
                                    onChange={this.handleLabelsChange.bind(this)}
                                />
                            </div>
                        </InputGroup>
                        
                        <br/>
                        <label>Utilized by (+2 hops):</label>
                        <InputGroup className="p-1">
                            <div style={{width: '300px'}}>
                                <Select
                                    isMulti
                                    // closeMenuOnSelect={false}
                                    value={this.state.selectedOptions}
                                    options={this.state.options}
                                    // onFocus={this.handleClickSelect.bind(this)}
                                    onChange={this.handleOptionsChange.bind(this)}
                                />
                            </div>
                        </InputGroup>

                        </Card.Body>
                    </Collapse>
                </Card>
            </div>
        )
    }
}
