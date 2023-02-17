const ROOT_APP = 'http://130.225.39.214:3000'

// Routine to manage the two main tabs of the application
const openQueryTab = (evt, tabName) => {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

const runEvent = async (action, data, handler_fn) => {
    const response = await fetch(`${ROOT_APP}/${action}`,{
        method: "POST",
        mode: 'cors',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    response.json().then(handler_fn);
}

const handleStats = async function (response) {
    const data = response.answer
    let versions = []
    let cr = []
    let dyn = []
    let gr = []
    let ec = []
    let tec = []
    let oc = []
    // Change-ratio
    for (let i in data) {
        versions.push(parseInt(data[i]['Version']))
        cr.push(parseInt(data[i]['Change-ratio']))
        dyn.push(parseInt(data[i]['Dynamicity']))
        gr.push(parseInt(data[i]['Growth-ratio']))
        ec.push(parseInt(data[i]['Entity-changes']))
        tec.push(parseInt(data[i]['Triple-to-entity-change']))
        oc.push(parseInt(data[i]['Object-updates']))
    }
    Plotly.newPlot("plot-change-ratio", [{ x: versions, y: cr, type: 'lines+markers'}], {title: "Change-ratio"})
    Plotly.newPlot("plot-dynamicity", [{ x: versions, y: dyn, type: 'lines+markers'}], {title: "Dynamicity"})
    Plotly.newPlot("plot-growth-ratio", [{ x: versions, y: gr, type: 'lines+markers'}], {title: "Growth-ratio"})
    Plotly.newPlot("plot-entity-change", [{ x: versions, y: ec, type: 'lines+markers'}], {title: "Entity-changes"})
    Plotly.newPlot("plot-triple-entity-change", [{ x: versions, y: tec, type: 'lines+markers'}], {title: "Triple-to-entity-change"})
    Plotly.newPlot("plot-object-updates", [{ x: versions, y: oc, type: 'lines+markers'}], {title: "Object-updates"})
}

const clearQueryResponses = async function () {
    yasgui.getTab().yasr.setResponse({
        data: `{
            "head": {
                "vars": [
                    "s",
                    "p",
                    "o"
                ]
            },
            "results": {
                "bindings": []
            },
            "metadata": {
                "httpRequests": 0
            }
        }`,
        contentType: "application/sparql-results+json",
        status: 200,
        executionTime: 0
    });
    yasgui.getTab().yasr.draw();
}

const handleQuerySelect = async function (selection) {
    window.querySelection = selection.value
    await drawQuery()
}

const handleQueries = async function (response) {
    window.queries = response.answer
    const queryDropdown = document.getElementById('queries-select')
    for (const q in response.answer) {
        let queryOption = document.createElement('option')
        queryOption.setAttribute('value', q)
        queryOption.setAttribute('onClick', 'handleQuerySelect(this)')
        const keyName = q === '0' ? "Default" : `Query ${q}`
        let queryText = document.createTextNode(keyName)
        queryOption.appendChild(queryText)
        queryDropdown.appendChild(queryOption)
    }
    await handleQuerySelect(queryDropdown.firstChild)
}

const drawVersionQuerySection = function (version, extraIndent) {
    const indent = extraIndent ? '\t' : ''
    const versionTag = version === '?version' ? version : `<version:${version}>`
    let str = `\n\t${indent}GRAPH ${versionTag} {`
    for (const l in window.queries[window.querySelection]["core"]) {
        str += `\n\t\t${indent}${window.queries[window.querySelection]["core"][l]}`
    }
    str += `\n\t${indent}}`
    return str
}

const drawQuery = async function () {
    await clearQueryResponses()
    let queryHeader = ''
    let firstHeader = true
    for (const l in window.queries[window.querySelection]["header"]) {
        const newline = firstHeader ? '' : '\n'
        queryHeader += newline + window.queries[window.querySelection]["header"][l]
        firstHeader = false
    }
    const queryTypeRadios = document.getElementsByName('query-type')
    const queryType = Array.from(queryTypeRadios).find((radio) => radio.checked).value
    let queryCore = 'SELECT * WHERE {'
    switch (queryType) {
        case 'vm':
            queryCore += drawVersionQuerySection(1, false)
            break
        case 'dm':
            queryCore += drawVersionQuerySection(1, false) + ' .'
            queryCore += '\n\tFILTER (NOT EXISTS {'
            queryCore += drawVersionQuerySection(4, true)
            queryCore += '\n\t})'
            break
        case 'vq':
            queryCore += drawVersionQuerySection('?version', false)
            break
        default:
            console.log('???')
    }
    queryCore += '\n}'
    const query = `${queryHeader}\n${queryCore}`
    yasgui.getTab().yasqe.setValue(query)
}

const resetQuery = async function () {
    const querySelectDropdown = document.getElementById('queries-select')
    querySelectDropdown.value = "0"
    window.querySelection = "0"
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();
