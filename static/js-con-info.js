document.addEventListener("DOMContentLoaded", function() {
    // Event listeners for buttons
    document.getElementById("refresh").addEventListener("click", function() {
        // In a real application, fetch data from server to update table.
    });

    document.getElementById("create").addEventListener("click", function() {
        addRowToTable();  // Adds an empty row to the table
    });

    document.getElementById("delete").addEventListener("click", function() {
        deleteSelectedRows();
    });

    document.getElementById("edit").addEventListener("click", function() {
        // Placeholder for Edit functionality: Implement as per requirements.
    });

    // Add row to table
    function addRowToTable(data = {}) {
        let table = document.getElementById("mainTable").getElementsByTagName('tbody')[0];
        let newRow = table.insertRow();

        // Checkbox Cell
        let checkboxCell = newRow.insertCell(0);
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "rowSelect";
        checkboxCell.appendChild(checkbox);

        // Status Cell
        let statusCell = newRow.insertCell(1);
        statusCell.className = "statusCell";
        statusCell.textContent = data.status || "Checking...";  // Initial value before actual check

        // Name Cell
        let nameCell = newRow.insertCell(2);
        nameCell.contentEditable = true;
        nameCell.textContent = data.name || "Editable Name";

        // User Cell (dropdown)
        let userCell = newRow.insertCell(3);
        let userDropdown = document.createElement("select");
        userDropdown.className = "userDropdown";
        // You'd typically fetch user data from the server and populate the dropdown. 
        // Here's a placeholder:
        ["root (Full User)", "alice (Full User)", "connUser1 (Connection User)"].forEach(opt => {
            let option = document.createElement("option");
            option.value = opt;
            option.textContent = opt;
            userDropdown.appendChild(option);
        });
        userCell.appendChild(userDropdown);

        // Remote Client Cell
        let remoteClientCell = newRow.insertCell(4);
        remoteClientCell.contentEditable = true;
        remoteClientCell.textContent = data.remoteClient || "";

        // Remote Client Port Cell
        let remoteClientPortCell = newRow.insertCell(5);
        remoteClientPortCell.contentEditable = true;
        remoteClientPortCell.textContent = data.remoteClientPort || "";

        // Server Cell
        let serverCell = newRow.insertCell(6);
        serverCell.textContent = data.server || "hostname";  // "hostname" might be replaced with an actual call to get the hostname.

        // Server Ports Cell
        let serverPortsCell = newRow.insertCell(7);
        serverPortsCell.contentEditable = true;
        serverPortsCell.textContent = data.serverPorts || "";

        // Certificate Cell (dropdown)
        let certCell = newRow.insertCell(8);
        let certDropdown = document.createElement("select");
        certDropdown.className = "certDropdown";
        // Placeholder certificates, in a real scenario you'd populate this based on the user and fetch from server.
        ["cert1", "cert2", "N/A"].forEach(cert => {
            let option = document.createElement("option");
            option.value = cert;
            option.textContent = cert;
            certDropdown.appendChild(option);
        });
        certCell.appendChild(certDropdown);

        // lsof Cell
        let lsofCell = newRow.insertCell(9);
        let lsofButton = document.createElement("button");
        lsofButton.textContent = "Status";
        lsofButton.onclick = function() {
            // Call your lsof function and show popup/dialog
        };
        lsofCell.appendChild(lsofButton);

        // ss Cell
        let ssCell = newRow.insertCell(10);
        let ssButton = document.createElement("button");
        ssButton.textContent = "Status";
        ssButton.onclick = function() {
            // Call your ss function and show popup/dialog
        };
        ssCell.appendChild(ssButton);

        // Client Command Cell
        let clientCmdCell = newRow.insertCell(11);
        clientCmdCell.textContent = "show";  // You'll probably want to add an event listener to show the command in a popup/dialog.
    }

    // Delete Selected Rows
    function deleteSelectedRows() {
        let table = document.getElementById("mainTable");
        let checkboxes = table.querySelectorAll(".rowSelect:checked");
        checkboxes.forEach(checkbox => {
            let rowIndex = checkbox.closest("tr").rowIndex;
            table.deleteRow(rowIndex);
        });
    }

    // Mockup: This function can be expanded to continuously check the 'status' of connections every 30 seconds.
    function refreshStatuses() {
        setInterval(() => {
            let statusCells = document.querySelectorAll(".statusCell");
            statusCells.forEach(cell => {
                // In a real scenario, you'd check the actual status here.
                cell.textContent = "Connected";  // This is just a mockup
            });
        }, 30000);  // 30 seconds
    }
    refreshStatuses();
});
