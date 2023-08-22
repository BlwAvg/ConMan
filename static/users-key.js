// This event listener waits for the document to be fully loaded before executing the code inside.
window.addEventListener('DOMContentLoaded', (event) => {
    // Calls the fetchKeys function to get the initial set of keys.
    fetchKeys();

    // Selects the button with an 'onclick' attribute set to 'generateKeyForUser()' and binds the generateKeyForUser function to its click event.
    const generateButton = document.querySelector('button[onclick="generateKeyForUser()"]');
    generateButton.addEventListener('click', generateKeyForUser);

    // Selects the button with an 'onclick' attribute set to 'deleteSelectedKeys()' and binds the deleteSelectedKeys function to its click event.
    const deleteButton = document.querySelector('button[onclick="deleteSelectedKeys()"]');
    deleteButton.addEventListener('click', deleteSelectedKeys);
});

// Function to fetch the keys from the backend and populate them into the table.
function fetchKeys() {
    fetch('/get_keys')
        .then(response => response.json()) // Converts the response to JSON format.
        .then(keys => {
            // Calls populateTable to display the fetched keys in the table.
            populateTable(keys);
        })
        .catch(err => {
            // Logs any errors that occur while fetching the keys.
            console.error('Error fetching keys:', err);
        });
}

// Function to populate the keys into the table.
function populateTable(keys) {
    const tbody = document.getElementById('keysTableBody');
    tbody.innerHTML = ''; // Clears the table body content.

    // Iterates over the keys and inserts each key as a row in the table.
    keys.forEach(key => {
        const row = tbody.insertRow();

        // Creates a checkbox for each key.
        const checkboxCell = row.insertCell(0);
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = key.username;
        checkboxCell.appendChild(checkbox);

        // Creates an editable div for the filename of each key.
        const nameCell = row.insertCell(1);
        const nameDiv = document.createElement('div');
        nameDiv.contentEditable = true;
        nameDiv.onblur = function() { renameKeyFile(key.username, this.textContent) }; // Calls renameKeyFile when the content is edited and focus is lost.
        nameDiv.innerText = key.filename;
        nameCell.appendChild(nameDiv);

        // Inserts the remaining key properties into the table.
        row.insertCell(2).innerText = key.username;
        row.insertCell(3).innerText = key.file_path;
        row.insertCell(4).innerText = key.key_type;
        row.insertCell(5).innerText = key.public_key.split(' ')[0]; // Only displays the first part of the public key.

        // Creates buttons for copying the public and private keys.
        const copyCell = row.insertCell(6);
        const publicButton = document.createElement('button');
        publicButton.textContent = 'Public';
        publicButton.addEventListener('click', () => {
            copyToClipboard(key.public_key);
            alert(`Copied public key for ${key.username}: ${key.filename}`);
        });
        const privateButton = document.createElement('button');
        privateButton.textContent = 'Private';
        privateButton.addEventListener('click', () => {
            fetchPrivateAndCopy(key);
        });
        copyCell.appendChild(publicButton);
        copyCell.appendChild(privateButton);
    });
}

// Function to copy a given text to the clipboard.
function copyToClipboard(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
}

// Function to fetch the private key for a given key and copy it to the clipboard.
function fetchPrivateAndCopy(key) {
    fetch(`/get_private_key/${key.username}/${key.filename.replace('.pub', '')}`)
        .then(response => response.json())
        .then(data => {
            copyToClipboard(data.private_key);
            alert(`Copied private key for ${key.username}: ${key.filename}`);
        })
        .catch(error => {
            console.error('Failed to fetch private key:', error);
        });
}

// Function to generate a new SSH key for a user.
function generateKeyForUser() {
    const username = document.getElementById('usernameInput').value;
    if (!username) {
        alert('Please enter a username');
        return;
    }

    fetch(`/generate_ssh_key/${username}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to generate key for user.');
        }
    })
    .then(data => {
        if (data.success) {
            fetchKeys(); // Refreshes the keys in the table after generating a new key.
        }
    })
    .catch(error => {
        console.error(error);
    });
}

// Function to delete the selected keys.
function deleteSelectedKeys() {
    const checkboxes = document.querySelectorAll('#keysTableBody input[type="checkbox"]:checked');
    const keysToDelete = Array.from(checkboxes).map(checkbox => {
        return {
            username: checkbox.value,
            filename: checkbox.closest('tr').querySelector('div[contentEditable="true"]').textContent
        };
    });

    fetch('/delete_key', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(keysToDelete)
    })
    .then(response => {
        if (response.ok) {
            fetchKeys(); // Refreshes the keys in the table after deletion.
        } else {
            throw new Error('Failed to delete keys.');
        }
    })
    .catch(error => {
        console.error(error);
    });
}

// Function to rename a key file.
function renameKeyFile(username, newFilename) {
    fetch(`/rename_key/${username}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newFilename })
    })
    .then(response => {
        if (response.ok) {
            fetchKeys(); // Refreshes the keys in the table after renaming.
        } else {
            throw new Error('Failed to rename key file.');
        }
    })
    .catch(error => {
        console.error(error);
    });
}
