$(document).ready(function(){
    function fetchData() {
        $.get('/network-data', function(data) {
            // SS-LTUA table
            let ss_ltua_table = '<tr><th>Netid</th><th>State</th><th>Recv-Q</th><th>Send-Q</th><th>Local Address:Port</th><th>Peer Address:Port</th><th>Process</th></tr>';
            let rows = data.ss_ltua.trim().split("\n");
            for (let row of rows) {
                if(row.startsWith("Netid")) continue; 
                let values = row.split(/\s+/); 
                ss_ltua_table += `<tr>
                    <td>${values[0]}</td>
                    <td>${values[1]}</td>
                    <td>${values[2]}</td>
                    <td>${values[3]}</td>
                    <td>${values[4]}</td>
                    <td>${values[5]}</td>
                    <td>${values.slice(6).join(' ')}</td>
                </tr>`;
            }
            $('#ss-ltua').html(ss_ltua_table);

                        // Other tables...
            
            // IP Routing Table
            let ip_route_table = '<tr><th>Destination</th><th>Gateway</th><th>Genmask</th><th>Flags</th><th>Metric</th><th>Ref</th><th>Use</th><th>Iface</th></tr>';
            for (let entry of data.parsed_ip_route) {
                ip_route_table += `<tr>
                    <td>${entry[0] || ''}</td>
                    <td>${entry[1] || ''}</td>
                    <td>${entry[2] || ''}</td>
                    <td>${entry[3] || ''}</td>
                    <td>${entry[4] || ''}</td>
                    <td>${entry[5] || ''}</td>
                    <td>${entry[6] || ''}</td>
                    <td>${entry[7] || ''}</td>
                </tr>`;
            }
            $('#ip-route').html(ip_route_table);

            // Active SSH Connections table
            let ssh_connections_table = '<tr><th>COMMAND</th><th>PID</th><th>USER</th><th>FD</th><th>TYPE</th><th>NAME</th></tr>';
            for (let entry of data.ssh_connections) {
                ssh_connections_table += `<tr>
                    <td>${entry[0]}</td>
                    <td>${entry[1]}</td>
                    <td>${entry[2]}</td>
                    <td>${entry[3]}</td>
                    <td>${entry[4]}</td>
                    <td>${entry[8]}</td>
                </tr>`;
            }
            $('#ssh-connections').html(ssh_connections_table);

            // IP Address table
            let interface_table = '<tr><th>Interface</th><th>IP</th><th>Subnet</th><th>Gateway</th></tr>';
            for (let entry of data.ip_addr) {
                interface_table += `<tr>
                    <td>${entry.interface}</td>
                    <td>${entry.ip}</td>
                    <td>${entry.subnet}</td>
                    <td>${data.default_gateway}</td>
                </tr>`;
            }
            $('#ip-addr').html(interface_table);

            $('#public-ip').text("Public IP: " + data.public_ip);
            $('#dns-servers').text("DNS Servers: " + data.dns_servers.join(', '));
        });
    }

    fetchData(); 
    $('#refresh').click(function() {
        fetchData();
    });
});
