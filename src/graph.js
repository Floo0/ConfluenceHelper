import React, { PureComponent } from 'react'
import {Card, Collapse, Button} from 'react-bootstrap'
import { ForceGraph2D } from 'react-force-graph'
import PubSub from 'pubsub-js'

import { getGraph, deleteNode } from './neo4j'


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

        this.graphRef = React.createRef()

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
        // deleteNode(node.id)
        setTimeout(this.reloadGraph.bind(this), 500)
    }

    handleReload(event) {
        event.stopPropagation()
        this.reloadGraph()
    }

    // used to reload graph if data changed (after some action with neo4j)
    reloadGraph() {
        getGraph(this)
    }

    parseNodeLabel(data) {
        // console.log("parseNodeLabel:", data)
        var label = "ID:" + data.id
        label += "<br>Page Rank: " + data.pageRank
        label += "<br>Name: " + data.name
        // label += "<br>Label: " + data.label
        label += "<br>Link: " + data.link
        return label
    }

    renderNode(node, ctx, currentGlobalScale, isShadowContext) {
        // console.log("renderNode:", this, node, ctx, currentGlobalScale, isShadowContext)
        // console.log("renderNode", node.label)
        // node shape -circle
        var rad = 2
        if (node.pageRank !== 0) {
            rad = (1/node.pageRank + rad)/2
        }
        ctx.beginPath()
        ctx.arc(node.x, node.y, rad, 0, 2 * Math.PI, false)
        ctx.fillStyle = "hsl(300, 75%, 40%)"
        switch (node.label) {
            case "knowledge":
                ctx.fillStyle = "hsl(359, 84%, 70%)" // red
                break
            case "paper":
                ctx.fillStyle = "hsl(225, 75%, 70%)" // blue
                break
            case "project":
                ctx.fillStyle = "hsl(135, 75%, 70%)" // green
                break
            case "editor":
                ctx.fillStyle = "hsl(40, 91%, 70%)" // yellow
                break
        }
        ctx.fill()

        // node label - name
        const label = node.name
        const fontSize = 12/currentGlobalScale
        const offset = rad*(currentGlobalScale + 65)/100 + 1
        // const textWidth = ctx.measureText(label).width
        // const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
        //# label background
        // ctx.fillStyle = 'hsl(0, 0%, 100%)'
        // ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions)
        //# text
        ctx.fillStyle = 'hsl(0, 0%, 0%)'
        ctx.font = `${fontSize}px Sans-Serif`
        ctx.fillText(label, node.x + offset, node.y - offset)
        // link props
    }

    componentDidMount() {
        this.reloadGraph()
    }

    componentDidUpdate() {
        this.graphRef.current.zoom(5,100)
    }

    render() {
        // console.log("render graph")
        return (
            <div id="Graph" style={{overflow: "hidden"}}>
                <Card style={{border: "#d8cebc solid 2px"}}>
                    <Card.Header onClick={this.handleClickHeader.bind(this)} style={{height: "63px"}}>
                            <h5 style={{marginTop: "7px", float: "left", minWidth: "80px"}}>Graph</h5>
                            <Button className="float-right" variant="secondary" onClick={this.handleReload.bind(this)}>Reload</Button>
                    </Card.Header>
                    <Collapse in={!this.state.collapse} className={"p-0"}>
                        <div>
                            <ForceGraph2D
                                ref={this.graphRef}
                                graphData={this.state.graph}
                                // width={1000}
                                width={window.innerWidth}
                                height={550}
                                linkDirectionalArrowLength={3}
                                linkWidth={2}

                                // interaction
                                onNodeClick={this.handleOnNodeClick.bind(this)}
                                onNodeRightClick={this.handleNodeRightClick.bind(this)}
                                nodeLabel={this.parseNodeLabel.bind(this)}

                                // force engine
                                d3AlphaMin={0.1}
                                d3AlphaDecay={0.0228}
                                d3VelocityDecay={0.1}
                                warmupTicks={100}


                                // rendering
                                nodeCanvasObject={this.renderNode.bind(this)}
                            /> 
                        </div>
                    </Collapse>
               </Card>
            </div>
        )
    }
}
