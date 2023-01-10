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

const clear_query = async function (yasgui) {
    yasgui.getTab().yasqe.setValue("");
}
//runEvent('', {'message': 'Hallo Server!'}, handle_response_default);

