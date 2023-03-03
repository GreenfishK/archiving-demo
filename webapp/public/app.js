const ROOT_APP = 'http://130.225.39.214:3000'

// Routine to manage the two main tabs of the application
const openTab = (button, tabName) => {
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
    button.className += " active";
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

const openQueryTab = async function () {
    const queryButton = document.getElementById('query-tab')
    openTab(queryButton, 'queries')
    await runEvent('queries', {}, handleQueries)
    await runEvent('snapshots', {}, (response) => {
        let snapshotList = document.getElementById('snapshot-list')
        if (snapshotList === null) {
            console.log(response.answer)
            snapshotList = document.createElement('datalist')
            snapshotList.setAttribute('class', 'snapshot-list')
            snapshotList.setAttribute('id', 'snapshot-list')
            for (const snapshot in response.answer.snapshots) {
                const v = response.answer.snapshots[snapshot]
                const snapshotListItem = document.createElement('option')
                snapshotListItem.setAttribute('value', v)
                snapshotList.appendChild(snapshotListItem)
            }
            document.getElementById('query-options-panel').appendChild(snapshotList)
            document.getElementById('start-version-range').setAttribute('list', 'snapshot-list')
            document.getElementById('end-version-range').setAttribute('list', 'snapshot-list')
        }
    })
}

const openStatsTab = async function () {
    const statsButton = document.getElementById('stats-tab')
    openTab(statsButton, 'statistics')
    await runEvent('stats', {}, handleStats)
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
        cr.push(parseFloat(data[i]['Change-ratio']))
        dyn.push(parseFloat(data[i]['Dynamicity']))
        gr.push(parseFloat(data[i]['Growth-ratio']))
        ec.push(parseInt(data[i]['Entity-changes']))
        tec.push(parseFloat(data[i]['Triple-to-entity-change']))
        oc.push(parseInt(data[i]['Object-updates']))
    }
    const xAxis = {
        title: 'Version',
        showgrid: true
    }
    Plotly.newPlot("plot-change-ratio", [{ x: versions, y: cr, mode: 'lines+markers'}], {title: "Change-ratio", xaxis: xAxis})
    Plotly.newPlot("plot-dynamicity", [{ x: versions, y: dyn, mode: 'lines+markers'}], {title: "Vocabulary Dynamicity", xaxis: xAxis})
    Plotly.newPlot("plot-growth-ratio", [{ x: versions, y: gr, mode: 'lines+markers'}], {title: "Growth-ratio", xaxis: xAxis})
    Plotly.newPlot("plot-entity-change", [{ x: versions, y: ec, mode: 'lines+markers'}], {title: "Entity-changes", xaxis: xAxis})
    Plotly.newPlot("plot-triple-entity-change", [{ x: versions, y: tec, mode: 'lines+markers'}], {title: "Triple-to-entity-change", xaxis: xAxis})
    Plotly.newPlot("plot-object-updates", [{ x: versions, y: oc, type: 'bar'}], {title: "Object-updates", xaxis: xAxis})
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

// Set default values for query interface
// - set version sliders default values (should maybe be done somewhere else ? at tab loading ?)
// - set default query type from radio button
// - get the default query to draw into yasgui by calling handleQuerySelect()
const setQueryDefault = async function () {
    // Set default version value for sliders and declare global variables
    window.queryStartVersion = (window.queryStartVersion === undefined) ? "0" : window.queryStartVersion
    document.getElementById('start-version-range').value = window.queryStartVersion
    document.getElementById('start-version-output').innerText = window.queryStartVersion
    window.queryEndVersion = (window.queryEndVersion === undefined) ? "2" : window.queryEndVersion
    document.getElementById('end-version-range').value = window.queryEndVersion
    document.getElementById('end-version-output').innerText = window.queryEndVersion
    // Get query type
    const queryTypeRadios = document.getElementsByName('query-type')
    window.queryType = Array.from(queryTypeRadios).find((radio) => radio.checked).value
    // Draw default query
    const queryDropDown = document.getElementById('queries-select')
    window.querySelection = (window.querySelection === undefined) ? queryDropDown.firstChild.value : window.querySelection
    queryDropDown.value = window.querySelection
    await drawQuery()
}

// Handle the queries being received from the server
// - populate query dropdown
const handleQueries = async function (response) {
    window.queries = response.answer
    const queryDropdown = document.getElementById('queries-select')
    queryDropdown.innerHTML = ''  // clear the dropdown of elements (if any)
    for (const q in response.answer) {
        let queryOption = document.createElement('option')
        queryOption.setAttribute('value', q)
        const keyName = q === '0' ? "Default" : `Query ${q}`
        let queryText = document.createTextNode(keyName)
        queryOption.appendChild(queryText)
        queryDropdown.appendChild(queryOption)
    }
   await setQueryDefault()
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

const showHideVersionSelectors = function () {
    const startVersionSelector = document.getElementById("start-version-selector")
    const endVersionSelector = document.getElementById("end-version-selector")
    switch (window.queryType) {
        case 'vm':
            startVersionSelector.style.display = "block"
            endVersionSelector.style.display = "none"
            break
        case 'dm':
            startVersionSelector.style.display = "block"
            endVersionSelector.style.display = "block"
            break
        case 'vq':
            startVersionSelector.style.display = "none"
            endVersionSelector.style.display = "none"
    }
}

const drawQuery = async function () {
    await clearQueryResponses()
    showHideVersionSelectors()
    // Get the selected query's header
    let queryHeader = ''
    let firstHeader = true
    for (const l in window.queries[window.querySelection]["header"]) {
        const newline = firstHeader ? '' : '\n'
        queryHeader += newline + window.queries[window.querySelection]["header"][l]
        firstHeader = false
    }
    // Get the selected query's core
    let queryCore = 'SELECT * WHERE {'
    switch (window.queryType) {
        case 'vm':
            queryCore += drawVersionQuerySection(window.queryStartVersion, false)
            break
        case 'dm':
            queryCore += drawVersionQuerySection(window.queryStartVersion, false) + ' .'
            queryCore += '\n\tFILTER (NOT EXISTS {'
            queryCore += drawVersionQuerySection(window.queryEndVersion, true)
            queryCore += '\n\t})'
            break
        case 'vq':
            queryCore += drawVersionQuerySection('?version', false)
            break
        default:
            console.log('???')
    }
    queryCore += '\n} LIMIT 20\n'
    const query = `${queryHeader}\n${queryCore}`
    yasgui.getTab().setQuery(query)
}

// Redraw the current query only changing versioning information
const reDrawQuery = async function () {
    const vRegex = /GRAPH <version:\d+>?/g
    let query = yasgui.getTab().getQuery()
    switch (window.queryType) {
        case undefined:
            await setQueryDefault()
            break
        case 'vm':
            query = query.replaceAll(vRegex, `GRAPH <version:${window.queryStartVersion}>`)
            break
        case 'dm':
            const matches = query.matchAll(vRegex)
            let i = 0
            for (const match of matches) {
                if (i % 2 === 0) {
                    query = query.replace(match[0], `GRAPH <version:${window.queryStartVersion}>`)
                } else {
                    query = query.replace(match[0], `GRAPH <version:${window.queryEndVersion}>`)
                }
                i++
            }
            break
        case 'vq':
            // do nothing
            break
    }
    yasgui.getTab().setQuery(query)
}

const onSliderUpdate = async function (slider) {
    switch (slider.name) {
        case 'start-version-range':
            window.queryStartVersion = slider.value
            document.getElementById('start-version-output').innerText = slider.value
            break
        case 'end-version-range':
            window.queryEndVersion = slider.value
            document.getElementById('end-version-output').innerText = slider.value
            break
    }
    await reDrawQuery()
}

const onClickQueryType = async function (radio) {
    window.queryType = radio.value
    await drawQuery()
}

const resetQuery = async function () {
    const querySelectDropdown = document.getElementById('queries-select')
    querySelectDropdown.value = "0"
    window.querySelection = "0"
    await drawQuery()
}

const handleQueryChange = async function (instance, req) {
    // Find the version(s) identifier(s)
    const vRegex = /GRAPH (<version:)?(\d+|\?[a-zA-Z]+)>?/g
    const matches = instance.getValue().matchAll(vRegex)
    let matchCount = 0
    let values = []
    for (const match of matches) {
        matchCount++
        values.push(match[2])
    }
    // Detect the query type
    // and change the checked radio button accordingly
    switch (values.length) {
        case 0:
            console.log('Unrecognized version query')
            break
        case 1:
            if (values[0][0] === '?') {
                window.queryType = 'vq'
                document.getElementById('vq').checked = true
            } else {
                window.queryType = 'vm'
                document.getElementById('vm').checked = true
            }
            break
        case 2:
            window.queryType = 'dm'
            document.getElementById('dm').checked = true
            break
        default:
            console.log('Unknown query type')
    }
    showHideVersionSelectors()
    // Update the version selectors with the new values
    switch (window.queryType) {
        case 'vm':
            window.queryStartVersion = values[0]
            document.getElementById('start-version-range').value = window.queryStartVersion
            document.getElementById('start-version-output').innerText = window.queryStartVersion
            break
        case 'dm':
            window.queryStartVersion = values[0]
            window.queryEndVersion = values[1]
            document.getElementById('start-version-range').value = window.queryStartVersion
            document.getElementById('end-version-range').value = window.queryEndVersion
            document.getElementById('start-version-output').innerText = window.queryStartVersion
            document.getElementById('end-version-output').innerText = window.queryEndVersion
            break
        default:
    }
}

const handleQueryTabOpen = async function (instance, newTabId) {
    instance.getTab(newTabId).getYasqe().on("changes", handleQueryChange)
}

yasgui.on("tabSelect", handleQueryTabOpen)
yasgui.getTab().getYasqe().on("changes", handleQueryChange)

// Get the element with id="query-tab" and click on it
document.getElementById("query-tab").click();
