// MATCH (n)-[r]->(m) RETURN n, TYPE(r), m

// import { neo4j } from 'neo4j-driver'
import { customAlphabet } from 'nanoid'
import {cloneDeep} from 'lodash'


// const host = 'bolt://localhost'
const host = 'bolt://141.30.136.185'
const port = '7687'
const relationType = 'DETAIL'

// takes in a single neo4j record and extracts the node properties
function parseRecordToNode(record, column) {
    const node = record.get(column)
    // console.log("parseRecordToNode", node, record, column)
    if (node == null) {return} // skip empty nodes

    // labels
    var label = ""
    if (node.labels) {
        label = node.labels[0]
    }
    // properties
    var pageRank = 0
    var name = ""
    var link = ""
    var creation = ""
    var update = ""
    var parent = ""
    var short = ""
    if (node.properties) {
        if (node.properties.pageRank) {
            pageRank = node.properties.pageRank
        }
        if (node.properties.name) {
            name = node.properties.name
        }
        if (node.properties.link) {
            link = node.properties.link
        }
        if (node.properties.creation) {
            creation = node.properties.creation
        }
        if (node.properties.update) {
            update = node.properties.update
        }
        if (node.properties.parent) {
            parent = node.properties.parent
        }
        if (node.properties.short) {
            short = node.properties.short
        }
    }

    const parsedNode = {
        "id": node.identity.high.toString() + node.identity.low.toString(),
        "pageRank": pageRank,
        "name": name,
        "label": label,
        "link": link,
        "creation": new Date(creation),
        "update": new Date(update),
        "parent": parent,
        "short": short,
    }
    // console.log("parseRecordToNode parsedNode:", parsedNode)
    return parsedNode
}

// takes in a single neo4j record and extracts the link properties
function parseRecordToLink(record, column) {
    const link = record.get(column)
    // console.log("parseLink", link)
    if (link == null) {return null}

    var label = ""
    if (link.labels) {
        label = link.labels[0]
    }
    var name = ""
    if (link.properties && link.properties.name) {
        name = link.properties.name
    }

    const parsedLink = {
        "id": link.identity.high.toString() + link.identity.low.toString(),
        "source": link.start.high.toString() + link.start.low.toString(),
        "target": link.end.high.toString() + link.end.low.toString()
    }
    return parsedLink
}

function checkNodeInList(newNode, nodes) {
    for (const node of nodes) {
        if (newNode.id === node.id){
            return true
        }
    }
    return false
}

function parseGraph(results, component) {
    // console.log("parseGraph:", results)
    var nodes = []
    var links = []

    // handle response info
    if (results.summary.notifications.length > 0) {
        console.log("neo4j response info:", results.summary.notifications)
    }

    // access data
    for (const record of results.records) {
        // console.log("record:", record)
        const node = parseRecordToNode(record, 'n')
        if (!checkNodeInList(node, nodes)) {
            nodes.push(node)
        }

        const link = parseRecordToLink(record, 'r')
        if (link != null) {links.push(link)}

        // console.log("node, links", nodes, links)
    }

    const graph = {
        "nodes": nodes,
        "links": links
    }
    // console.log("graph:", graph)
    // console.log("component", component)
    component.setState({graph: graph})
}

function createDriver() {
    var neo4j = require('neo4j-driver')
    var driver = neo4j.driver(
        host + ':' + port,
        // 'bolt://localhost:7687',
        // neo4j.auth.basic('', '')
    )
    // console.log("driver:", driver)
    return driver
}

function createSession(driver) {
    var session = driver.session()
    // console.log("session:", session)
    return session
}

function runQueries(session, queries) {
    // console.log("runQueries:", queries)
    const query = queries[0]
    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            // console.log("results:", results)
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            if (queries.length > 1) {
                queries.shift()
                runQueries(session, queries)
            }
        })
        .catch(error => {
            console.log("runQuery:", query)
            console.log("runQueries error:", error)
        })
}

function updatePageRank(session) {
    // console.log("updatePageRank")
    var queries = []
    queries.push(`CALL gds.graph.create('pagerank_graph', '*', '*')`)
    queries.push(`CALL gds.pageRank.write('pagerank_graph', {maxIterations: 20, dampingFactor: 0.85, writeProperty:'pageRank'})`)
    queries.push(`CALL gds.graph.drop('pagerank_graph')`)

    runQueries(session, queries)
}

function parseNodes(results, component) {
    // console.log("parseNodes:", results)
    var nodes = [] // raw parsed nodes
    var creatorNodes = [] // special "value , labe, data" nodes for react-select

    // // handle response info
    // if (results.summary.notifications.length > 0) {
    //     console.log("neo4j response info:", results.summary.notifications)
    // }

    // access data
    for (const record of results.records) {
        // console.log("record:", record)
        const node = parseRecordToNode(record, 'n')
        if (!checkNodeInList(node, nodes)) {
            nodes.push(node)
        }
    }

    for (const node of nodes) {
        // create elements for react-select
        const creatorNode = {
            value: node.id,
            label: node.name,
            data: node, // used to transfer whole data
        }
        creatorNodes.push(creatorNode)
    }

    // console.log("creatorNodes:", creatorNodes)
    component.setState({options: creatorNodes})
}

function parseNode(results, id, component) {
    // console.log("parseNode:", results, id)
    var node = null
    var parents = []
    var oldParents = []

    // // handle response info
    // if (results.summary.notifications.length > 0) {
    //     console.log("neo4j response info:", results.summary.notifications)
    // }

    // access data
    for (const record of results.records) {
        // console.log("record:", record)
        for (const key of record.keys) {
            const parsedNode = parseRecordToNode(record, key)
            if (!parsedNode) {continue}
            // console.log("parsedNode:", parsedNode)
            if (parsedNode.id === id) {
                node = parsedNode
            } else {
                parents.push({value: parsedNode.id, label: parsedNode.name})
                oldParents.push(parsedNode.id)
            }
        }
    }

    // console.log("parsed node:", node, parents, oldParents)
    component.setState({
        id: id,
        name: node.name,
        link: node.link,
        creation: node.creation,
        update: node.update,
        short: node.short,
        parents: parents,  // current parent relations
        oldParents: oldParents, // parent ids saved for comparison with parents
    })
}

// retrieve all nodes and relations
// returns graph as {nodes, links}
export function getGraph(component) {
    // console.log("getData")

    var driver = createDriver()    
    var session = createSession(driver)

    session
        .run(`
            MATCH (n)
            OPTIONAL MATCH (n)-[r]->(m)
            RETURN n, r
        `)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            parseGraph(results, component)
            session.close()
            driver.close()
        })
}

// retrieve all nodes without relations but parents
// returns "option nodes" as {value, label, data}
export function getNodes(component) {
    var driver = createDriver()    
    var session = createSession(driver)

    session
        .run(`
            MATCH (n)
            RETURN n
        `)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            parseNodes(results, component)
            session.close()
            driver.close()
        })
}

// retrieve all properties and parent node ids for sepcific node id
export function getNode(component, id) {
    // console.log("getNode:", id)
    var driver = createDriver()    
    var session = createSession(driver)

    var query = `MATCH (n)`
    query += ` WHERE ID(n)=` + id.replace(/^0/, '') // delete leading zero, because api gets it wrong at 08
    query += ` OPTIONAL MATCH (m)-[r]->(n)`
    query += ` RETURN n, m`
    // console.log("query:", query)

    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            parseNode(results, id, component)
            session.close()
            driver.close()
        })
}

export function createNode(type, node, parents) {
    // console.log("createNode:", type, node, parents)
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)
    var driver = createDriver()
    var session = createSession(driver)

    var query = ``
    var linkIDs = []
    const nodeID = nanoid()
    if (parents) {
        for (const parentID of parents) {
            const id = nanoid()
            linkIDs.push(id)
            query += ` MATCH (` + id + `) WHERE ID(` + id + `)=` + parentID.replace(/(^0+)(.)/, '$2')
        }
    }
    switch (type) {
        case "knowledge":
            query += ` MERGE (` + nodeID + `:knowledge {name: '` + node.Name + `', link: '` + node.Link + `'`
            query += `, creation: '` + node.Creation + `', update: '` + node.Update + `', short: '` + node.Short +`'})`
            break
        case "paper":
            query += ` MERGE (` + nodeID + `:paper {name: '` + node.Name + `', link: '` + node.Link + `'`
            query += `, creation: '` + node.Creation + `', update: '` + node.Update + `', short: '` + node.Short +`'})`
            break
        case "project":
            query += ` MERGE (` + nodeID + `:project {name: '` + node.Name + `', link: '` + node.Link + `'`
            query += `, creation: '` + node.Creation + `', update: '` + node.Update + `', short: '` + node.Short +`'})`
            break
        case "editor":
            query += ` MERGE (` + nodeID + `:editor {name: '` + node.Name + `', link: '` + node.Link + `'})`
            break
    }
    for (const id of linkIDs) {
        query += ` MERGE (` + id + `)-[:` + relationType + `]->(` + nodeID + `)`
    }
    // console.log("query:", query)
    if (query === ""){
        console.error("Empty query, probably node type not set correctly.")
        return
    }

    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            // console.log("results:", results)
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            updatePageRank(session)
            // session.close() // -> is done in updatePageRank
            // driver.close()
        })
        .catch(error => {
            console.error("query:", query)
            console.error("neo4j error:", error)
        })
}

export function updateNode(node) {
    // console.log("updateNode", node)
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)
    var driver = createDriver()    
    var session = createSession(driver)

    var properties = cloneDeep(node)
    delete properties.id
    delete properties.createParents
    delete properties.deleteParents
    var createLinks = []
    var deleteLinks = []
    const nodeID = nanoid()

    var query = `MATCH (` + nodeID + `) WHERE ID(` + nodeID + `)=` + node.id.replace(/(^0+)(.)/, '$2') // delete leading zeros, because api gets it wrong at 08
    if (node.createParents) {
        for (const parent of node.createParents) {
            // console.log("parent", parent)
            const id = nanoid()
            createLinks.push(id)
            query += ` MATCH (` + id + `) WHERE ID(` + id + `)=` + parent.replace(/(^0+)(.)/, '$2')
        }
    }
    if (node.deleteParents) {
        for (const parent of node.deleteParents) {
            const id = nanoid()
            deleteLinks.push(id)
            query += ` MATCH (n)-[` + id + `:` + relationType + `]->(m) WHERE ID(n)=` + parent.replace(/(^0+)(.)/, '$2') + ` AND ID(m)=` + node.id.replace(/(^0+)(.)/, '$2')
        }
    }
    query += ` SET ` + nodeID + ` += ` + JSON.stringify(properties)
    query = query.replace(/"([^"]+?)":/g, (m, g) => {return g + `:`})
    for (const id of createLinks) {
        query += ` MERGE (` + id + `)-[:` + relationType + `]->(` + nodeID + `)`
    }
    var first = true
    for (const id of deleteLinks) {
        if (first) {
            query += ` DELETE ` + id
            first = false
        } else {
            query += `, ` + id
        }
    }
    // console.log("query:", query)

    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            // console.log("update results:", results)
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            session.close()
            driver.close()
        })
        .catch(error => {
            console.error(error)
        })
}

export function deleteNode(id) {
    // console.log("deleteNode")
    var driver = createDriver()    
    var session = createSession(driver)

    var query = `MATCH (n)`
    query += ` WHERE ID(n)=` + id.replace(/(^0+)(.)/, '$2') // delete leading zeros, because api gets it wrong at 08
    query += ` OPTIONAL MATCH (n)-[r]-()`
    query += ` DELETE n,r`

    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            // console.log("delete results:", results)
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            session.close()
            driver.close()
        })
        .catch(error => {
            console.error(error)
        })
}