import React, { PureComponent } from 'react'
import { Card, InputGroup, Form, FormControl, Dropdown, Button,  DropdownButton, Collapse } from 'react-bootstrap'
import Select from 'react-select'
import PubSub from 'pubsub-js'

import { getLabels } from './neo4j'


export default class Filter extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            collapse: false,
            selected: [
                {value: "knowledge", label: "Knowledge"},
                {value: "paper", label: "Paper"},
            ],
            labels: [],
        }

        getLabels(this)
    }

    handleLabelsChange(selected) {
        // console.log("handleLabelsChange:", selected)
        this.setState({selected: selected})

        var labels = []
        for (const element of selected) {
            labels. push(element.value)
        }
        var filter = {
            labels: labels
        }

        PubSub.publish('graph', {"do": "filter", "use": filter})
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
                        <Card.Body className="m-1" style={{height: 692}}>

                        <InputGroup className="p-1">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="basic-addon1" style={{width: "80px"}} className="p-1">Labels</InputGroup.Text>
                            </InputGroup.Prepend>
                            <div style={{width: '300px'}}>
                                <Select
                                    isMulti
                                    // closeMenuOnSelect={false}
                                    value={this.state.selected}
                                    options={this.state.labels}
                                    // onFocus={this.handleClickSelect.bind(this)}
                                    onChange={this.handleLabelsChange.bind(this)}
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