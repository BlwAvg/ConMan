// This script includes logic for:
// 
//     Populating the table with user data.
//     Fetching certificates based on the user.
//     Checking the connection status using lsof.
//     Showing the output of the ss command.
//     Displaying the client command.
//     Creating, deleting, and editing rows.
// 
// You'll need to integrate this with your existing HTML structure. Ensure that class names used in the script (like .user-dropdown, .connection-row, etc.) match with the class names you use in your HTML.
// 

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the table on page load
    populateTable();
    // Check status every 30 seconds
    setInterval(checkStatusForAllRows, 30000);
});

function populateTable() {
    fetchUsers();
    // Other initial data fetching can be added here
}

function fetchUsers() {
    fetch('/api/users')
        .then(response => response.json())
        .then(data => {
            let userDropdowns = document.querySelectorAll('.user-dropdown');
            userDropdowns.forEach(dropdown => {
                data.forEach(user => {
                    let option = document.createElement('option');
                    option.value = user.username;
                    option.text = `${user.type} - ${user.username}`;
                    dropdown.appendChild(option);
                });
            });
        });
}

function fetchCertsForUser(username, dropdownElement) {
    fetch(`/api/certs/${username}`)
        .then(response => response.json())
        .then(data => {
            dropdownElement.innerHTML = '';
            if (data.length === 0) {
                let option = document.createElement('option');
                option.value = "N/A";
                option.text = "N/A";
                dropdownElement.appendChild(option);
            } else {
                data.forEach(cert => {
                    let option = document.createElement('option');
                    option.value = cert;
                    option.text = cert;
                    dropdownElement.appendChild(option);
                });
            }
        });
}

function checkStatusForAllRows() {
    let rows = document.querySelectorAll('.connection-row');
    rows.forEach(row => {
        let ports = row.querySelector('.server-ports').textContent.split(',');
        checkLsofStatus(ports, row.querySelector('.status-button'));
    });
}

function checkLsofStatus(ports, buttonElement) {
    fetch('/api/lsof', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ports: ports })
    })
    .then(response => response.json())
    .then(data => {
        buttonElement.textContent = data.status ? "Connected" : "Not Connected";
    });
}

function checkSS(rowElement) {
    let ports = rowElement.querySelector('.server-ports').textContent.split(',');
    fetch('/api/ss', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ports: ports })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.result);
    });
}

function getClientCommand(rowElement) {
    let data = {
        user: rowElement.querySelector('.user-dropdown').value,
        remoteClientPort: rowElement.querySelector('.remote-client-port').textContent,
        serverPort: rowElement.querySelector('.server-ports').textContent,
        privateKey: rowElement.querySelector('.certificate-dropdown').value
    };
    fetch('/api/client-command', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.command);
    });
}

function createRow() {
    // Logic to create a new row in the table based on user input or default values
}

function deleteRows() {
    let checkboxes = document.querySelectorAll('.select-checkbox:checked');
    checkboxes.forEach(checkbox => {
        checkbox.closest('.connection-row').remove();
    });
}

function editRows() {
    // Logic to edit selected rows based on user input
}

function refreshTable() {
    populateTable();
}

// Event listeners for dropdown changes, button clicks, etc. can be added here.
// For instance:
document.querySelectorAll('.user-dropdown').forEach(dropdown => {
    dropdown.addEventListener('change', function() {
        let username = this.value;
        let certDropdown = this.closest('.connection-row').querySelector('.certificate-dropdown');
        fetchCertsForUser(username, certDropdown);
    });
});
