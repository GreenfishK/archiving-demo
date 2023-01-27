const ROOT_APP = "http://localhost:3000"

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

/**
* Add some pertinent doc.
*/
const handle_response_default = async (response) => {
	document.getElementById('queries-panel').innerHTML = 'The server says: ' + response.answer;
}

const handle_response_stats = async (response) => {
	document.getElementById('statistics-panel').innerHTML = 'The server says: ' + response.answer;
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
    clear_query_responses(yasgui);
}

const set_vm_template = async function (yasgui) {
    reset_query(yasgui);
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
    clear_query_responses(yasgui);
}

const set_v_template = async function (yasgui) {
    let qr_str = 'SELECT * WHERE {\n';
    qr_str += '\tGRAPH <version:?> {\n';
    qr_str += '\t\t?s ?p ?o .\n';
    qr_str += '\t}\n';
    qr_str += '} LIMIT 5';
    yasgui.getTab().yasqe.setValue(qr_str);
    clear_query_responses(yasgui);
}

//runEvent('', {'message': 'Hallo Server!'}, handle_response_default);

