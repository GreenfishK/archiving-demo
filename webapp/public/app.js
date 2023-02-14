const ROOT_APP = "http://130.225.39.214:3000"

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

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

const runEvent = async (action, data, handler_fn) => {
    const response = await fetch(`${ROOT_APP}/${action}`,{
        method: "POST",
        mode: 'cors',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    response.json().then(handler_fn);
}

const handle_stats = async function (response) {
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

const clear_query_responses = async function (yasgui) {
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

const reset_query = async function (yasgui) {
    let qr_str = 'SELECT * WHERE {\n';
    qr_str += '\tGRAPH <version:0> {\n';
    qr_str += '\t\t?s ?p ?o .\n';
    qr_str += '\t}\n';
    qr_str += '} LIMIT 5';
    yasgui.getTab().yasqe.setValue(qr_str);
    await clear_query_responses(yasgui);
}

const set_vm_template = async function (yasgui) {
    await reset_query(yasgui);
}

const set_dm_template = async function (yasgui) {
    let qr_str = 'SELECT * WHERE {\n';
    qr_str += '\tGRAPH <version:2> {\n';
    qr_str += '\t\t?s ?p ?o .\n';
    qr_str += '\t} .\n';
    qr_str += '\tFILTER (NOT EXISTS {\n';
    qr_str += '\t\tGRAPH <version:0> {\n';
    qr_str += '\t\t\t?s ?p ?o .\n';
    qr_str += '\t\t}\n';
    qr_str += '\t})\n'
    qr_str += '} LIMIT 5';
    yasgui.getTab().yasqe.setValue(qr_str);
    await clear_query_responses(yasgui);
}

const set_v_template = async function (yasgui) {
    let qr_str = 'SELECT * WHERE {\n';
    qr_str += '\tGRAPH <version:?> {\n';
    qr_str += '\t\t?s ?p ?o .\n';
    qr_str += '\t}\n';
    qr_str += '} LIMIT 5';
    yasgui.getTab().yasqe.setValue(qr_str);
    await clear_query_responses(yasgui);
}
