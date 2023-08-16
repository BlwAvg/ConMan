window.addEventListener('DOMContentLoaded', (event) => {
    fetchKeys();

    const generateButton = document.querySelector('button[onclick="generateKeyForUser()"]');
    generateButton.addEventListener('click', generateKeyForUser);

    const deleteButton = document.querySelector('button[onclick="deleteSelectedKeys()"]');
    deleteButton.addEventListener('click', deleteSelectedKeys);
});

function fetchKeys() {
    fetch('/get_keys')
        .then(response => response.json())
        .then(keys => {
            populateTable(keys);
        })
        .catch(err => {
            console.error('Error fetching keys:', err);
        });
}

function populateTable(keys) {
    const tbody = document.getElementById('keysTableBody');
    tbody.innerHTML = '';

    keys.forEach(key => {
        const row = tbody.insertRow();

        const checkboxCell = row.insertCell(0);
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = key.username;
        checkboxCell.appendChild(checkbox);

        const nameCell = row.insertCell(1);
        const nameDiv = document.createElement('div');
        nameDiv.contentEditable = true;
        nameDiv.onblur = function() { renameKeyFile(key.username, this.textContent) };
        nameDiv.innerText = key.filename;
        nameCell.appendChild(nameDiv);

        row.insertCell(2).innerText = key.username;
        row.insertCell(3).innerText = key.file_path;
        row.insertCell(4).innerText = key.key_type;
        row.insertCell(5).innerText = key.public_key.split(' ')[0];

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

function copyToClipboard(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
}

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
            fetchKeys();
        }
    })
    .catch(error => {
        console.error(error);
    });
}

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
            fetchKeys();
        } else {
            throw new Error('Failed to delete keys.');
        }
    })
    .catch(error => {
        console.error(error);
    });
}

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
            fetchKeys();
        } else {
            throw new Error('Failed to rename key file.');
        }
    })
    .catch(error => {
        console.error(error);
    });
}
