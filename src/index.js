// index.js
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {Navbar, Nav, Row, Col, Button,ButtonToolbar} from 'react-bootstrap'

import Graph from './graph'
import Creator from './creator'


class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            hide: {
                graph: false, // true,
                creator: false,
            }
        }
    }

    selectGraph(graph) {
        var hide = this.state.hide
        if (graph === "quantity") {hide.graph = !hide.graph}
        if (graph === "transition") {hide.creator = !hide.creator}
        this.setState({hide: hide})
    }
 
    render() {
        // console.log("render index")
        return (
            <div>
                <Navbar bg="dark" variant="dark">
                    <Nav style={{color: "#fff", backgrounColor: "#343a40"}}>
                        <Navbar.Brand className="px-3 py-2">Confluencer</Navbar.Brand>
                        <Nav.Link style={{color: this.state.hide.graph? "rgba(255,255,255,.5)": "rgba(255,255,255,0.9)",
                            paddingTop: "0.83em", fontWeight: this.state.hide.graph? "normal": "bold"}} 
                            onSelect={this.selectGraph.bind(this, 'quantity')} eventKey="main">Graph</Nav.Link>
                        <Nav.Link style={{color: this.state.hide.creator? "rgba(255,255,255,.5)": "rgba(255,255,255,0.9)",
                            paddingTop: "0.83em", fontWeight: this.state.hide.creator? "normal": "bold"}} 
                            onSelect={this.selectGraph.bind(this, 'transition')} eventKey="main">Creator</Nav.Link>
                    </Nav>
                </Navbar>
                <Row className="m-0 p-0" hidden={this.state.hide.graph}>
                    <Graph/>
                </Row>
                <Row className="m-0 p-0" hidden={this.state.hide.creator}>
                    <Creator/>
                </Row>
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);