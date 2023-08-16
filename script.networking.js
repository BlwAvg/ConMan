// Attach event listener to the refresh button
document.getElementById('refreshButton').addEventListener('click', fetchData);

function fetchData() {
    // Refresh data from all required commands
    fetchCommandData('ss-ltua', '/endpoint_for_ss_ltua');
    fetchCommandData('ss-s', '/endpoint_for_ss_s');
    fetchCommandData('ip-route', '/endpoint_for_ip_route');
    fetchInterfacesData('/endpoint_for_interfaces');
    fetchPublicIP();
    fetchDNSServers();
}

function fetchCommandData(tableId, endpoint) {
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById(tableId).querySelector('tbody');
            tableBody.innerHTML = '';  // Clear existing data

            data.forEach(row => {
                const tr = document.createElement('tr');
                row.forEach(cellData => {
                    const td = document.createElement('td');
                    td.innerText = cellData;
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error(`Error fetching data for ${tableId}:`, error);
        });
}

function fetchInterfacesData(endpoint) {
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('interfaces').querySelector('tbody');
            tableBody.innerHTML = '';  // Clear existing data

            data.forEach(interfaceData => {
                const tr = document.createElement('tr');
                
                // Assuming each interfaceData item has properties: name, ip, subnet, gateway
                const properties = ['name', 'ip', 'subnet', 'gateway'];
                properties.forEach(prop => {
                    const td = document.createElement('td');
                    td.innerText = interfaceData[prop];
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error fetching interfaces data:', error);
        });
}

function fetchPublicIP() {
    fetch('https://icanhazip.com/')
        .then(response => response.text())
        .then(ip => {
            document.getElementById('publicIP').innerText = ip.trim();
        })
        .catch(error => {
            console.error('Error fetching public IP:', error);
        });
}

function fetchDNSServers() {
    fetch('/endpoint_for_dns_servers')
        .then(response => response.json())
        .then(data => {
            const dnsList = document.getElementById('dnsServers');
            dnsList.innerHTML = ''; // Clear existing data

            data.forEach(server => {
                const li = document.createElement('li');
                li.innerText = server;
                dnsList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error fetching DNS servers:', error);
        });
}

// Trigger initial data fetch on page load
fetchData();
