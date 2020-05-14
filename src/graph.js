import React, { PureComponent } from 'react'
import {Card, Collapse, Button} from 'react-bootstrap'
import { ForceGraph2D } from 'react-force-graph'
import PubSub from 'pubsub-js'

import { getData, deleteNode } from './neo4j'


export default class Graph extends PureComponent {
    constructor(props) {
      super(props)

        this.state = {
            collapse: false,
            graph: {
                "nodes": [ 
                    { 
                      "id": "id1",
                      "name": "name1",
                      "val": 1 
                    },
                    { 
                      "id": "id2",
                      "name": "name2",
                      "val": 10 
                    },
                ],
                "links": [
                    {
                        "source": "id1",
                        "target": "id2"
                    },
                ]
            }
        }

        PubSub.subscribe('graph', this.onMessage.bind(this))
    }

    onMessage(topic,data) {
        // console.log("onMessage", topic, data)
        switch(data.do) {
            case "reload":
                this.reloadGraph()
                break
        }
    }

    handleClickHeader() {
        this.setState({collapse: !this.state.collapse})
    }

    handleOnNodeClick(node, event) {
        window.open(node.link, '_blank')
    }

    handleNodeRightClick(node, event) {
        // console.log("handleNodeRightClick:", node, event)
        deleteNode(node.id)
        this.reloadGraph()
    }

    handleReload(event) {
        event.stopPropagation()
        this.reloadGraph()
    }

    // used to reload graph if data changed (after some action with neo4j)
    reloadGraph() {
        getData(this)
    }

    parseNodeLabel(data) {
        // console.log("parseNodeLabel:", data)
        var label = "ID:" + data.id
        label += "<br>Name: " + data.name
        label += "<br>Label: " + data.label
        label += "<br>Link: " + data.link
        return label
    }

    componentDidMount() {
        this.reloadGraph()
    }

    render() {
        // console.log("render graph")

        return (
            <div id="Graph" style={{overflow: "hidden"}}>
                <Card style={{border: "#d8cebc solid 2px"}}>
                    <Card.Header onClick={this.handleClickHeader.bind(this)} style={{height: "63px"}}>
                            <h5 style={{marginTop: "7px", float: "left"}}>Graph</h5>
                            <Button className="float-right" variant="secondary" onClick={this.handleReload.bind(this)}>Reload</Button>
                    </Card.Header>
                    <Collapse in={!this.state.collapse} className={"p-0"}>
                        <div>
                            <ForceGraph2D
                                graphData={this.state.graph}
                                width={1000}
                                height={550}

                                // actions
                                onNodeClick={this.handleOnNodeClick.bind(this)}
                                onNodeRightClick={this.handleNodeRightClick.bind(this)}
                                nodeLabel={this.parseNodeLabel.bind(this)}
                            /> 
                        </div>
                    </Collapse>
               </Card>
            </div>
        )
    }
}
