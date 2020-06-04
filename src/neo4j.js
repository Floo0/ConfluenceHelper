// MATCH (n)-[r]->(m) RETURN n, TYPE(r), m

// import { neo4j } from 'neo4j-driver'


// const host = 'bolt://localhost'
const host = 'bolt://141.30.136.185'
const port = '7687'

function parseNode(record) {
    const node = record.get('n')
    // console.log("parseNode", node)

    // labels
    var label = ""
    if (node.labels) {
        label = node.labels[0]
    }
    // properties
    var pageRank = 0
    var name = ""
    var link = ""
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
    }

    const parsedNode = {
        "id": node.identity.high.toString() + node.identity.low.toString(),
        "pageRank": pageRank,
        "name": name,
        "label": label,
        "link": link
    }
    return parsedNode
}

function parseLink(record) {
    const link = record.get('r')
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

function parseResults(results, component) {
    // console.log("parseResults:", results)
    var nodes = []
    var links = []

    // handle response info
    if (results.summary.notifications.length > 0) {
        console.log("neo4j response info:", results.summary.notifications)
    }

    // access data
    for (const record of results.records) {
        // console.log("record:", record)
        const node = parseNode(record)
        if (!checkNodeInList(node, nodes)) {
            nodes.push(node)
        }

        const link = parseLink(record)
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

function _updatePageRank(session) {
    var query = `
        CALL gds.graph.create('pagerank_graph', '*', '*');
        CALL gds.pageRank.write('pagerank_example',
        {maxIterations: 20, dampingFactor: 0.85,     
        writeProperty:'pageRank'});
        CALL gds.graph.drop('pagerank_graph');
    `
    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            console.log("results:", results)
        })
        .catch(error => {
            console.log(error)
        })
}

export function getData(pointer) {
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
            parseResults(results, pointer)
            session.close()
            driver.close()
        })
}

export function createNode(type, node, links) {
    console.log("createNode:", type, node, links)
    var driver = createDriver()    
    var session = createSession(driver)

    var query = ``
    switch (type) {
        case "project":
            query += `MERGE (n:project {name: '` + node.Name + `', link: '` + node.Link + `'})`
            break
        case "editor":
            query += `MERGE (n:editor {name: '` + node.Name + `', link: '` + node.Link + `'})`
            break
    }
    if (links) {
        for (const link of links) {
            query += `MATCH (m) where ID(m)=` + link.Id
            query += `MERGE (m)-[:` + link.Type + `]->(n)`
        }
    }
    // console.log("query:", query)
    if (query === ""){
        console.error("Empty query, probably node type not set correctly.")
        return
    }
    // Create (n:TestLabel {name: '` + node.Name +`', link: '` + node.Link + `'})`
    // query += `<-[:` + links[0].Type + `]-(c:CLabel {name: '` + links[0].Target + `'})`

    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            console.log("results:", results)
            _updatePageRank(session)
            session.close()
            driver.close()
        })
        .catch(error => {
            console.error("query:", query)
            console.error("neo4j error:", error)
        })
}

export function deleteNode(id) {
    // console.log("deleteNode")
    var driver = createDriver()    
    var session = createSession(driver)

    session
        .run(`
            MATCH (n) where ID(n)=`+id+`
            OPTIONAL MATCH (n)-[r]-()
            DELETE n,r
        `)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            console.log("results:", results)
            session.close()
            driver.close()
        })
        .catch(error => {
            console.error(error)
        })
}