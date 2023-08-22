from flask import jsonify, send_from_directory
import subprocess
import requests

def parse_ip_addr(output):
    """Parse IP addresses from the provided output."""
    interfaces = []
    current_interface = None

    for line in output.split('\n'):
        if line and not line[0].isspace():
            if current_interface:
                interfaces.append(current_interface)
            current_interface = {
                "interface": line.split(':')[1].strip(),
                "ip": None,
                "subnet": None
            }
        elif 'inet ' in line:
            inet_data = line.strip().split(' ')
            ip, subnet = inet_data[1].split('/')
            current_interface["ip"] = ip
            current_interface["subnet"] = subnet

    if current_interface:
        interfaces.append(current_interface)

    return interfaces

def network_info():
    """Serve the network info HTML page."""
    return send_from_directory('static', 'network-info.html')

def network_data():
    """Retrieve various network-related data."""
    data = {}

    # Fetch command outputs
    data['ss_ltua'] = subprocess.check_output("ss -ltua", shell=True).decode('utf-8')
    data['ss_s'] = subprocess.check_output("ss -s", shell=True).decode('utf-8')
    data['ip_route'] = subprocess.check_output("ip route", shell=True).decode('utf-8')
    data['ssh_connections'] = get_active_ssh_connections()

    # Parse interface data 
    ip_addr_output = subprocess.check_output("ip addr", shell=True).decode('utf-8')
    data['ip_addr'] = parse_ip_addr(ip_addr_output)

    # Fetch default gateway
    ip_route_output = subprocess.check_output("ip route", shell=True).decode('utf-8')
    default_gateway = next((line.split()[-3] for line in ip_route_output.split('\n') if line.startswith('default')), None)
    data['default_gateway'] = default_gateway

    # Fetch IP Routes
    ip_route_output = subprocess.check_output("ip route", shell=True).decode('utf-8')
    data['parsed_ip_route'] = parse_ip_route(ip_route_output)

    # Fetch DNS servers
    with open('/etc/resolv.conf', 'r') as f:
        lines = f.readlines()
    dns_servers = [line.split()[-1] for line in lines if line.startswith('nameserver')]
    data['dns_servers'] = dns_servers

    # Fetch public IP
    try:
        data['public_ip'] = requests.get('https://icanhazip.com', timeout=5).text.strip()
    except requests.RequestException:
        data['public_ip'] = "Error fetching public IP"

    return jsonify(data)

def get_lsof_status(port):
    """Retrieve the lsof status for the given port."""
    result = subprocess.check_output(f"sudo lsof -i :{port}", shell=True).decode('utf-8')
    return jsonify(result.strip() if result else "Not Connected")

def get_ss_status(port):
    """Retrieve the ss status for the given port."""
    result = subprocess.check_output(f"ss -tuln | grep ':{port}'", shell=True).decode('utf-8')
    return jsonify(result.strip())

def get_client_command():
    """Provide a template SSH command for clients."""
    return jsonify("ssh -f -N -i PrivateKeyLocation -R ServerPort:localhost:RemoteClientPort User@Server")

def get_active_ssh_connections():
    """Retrieve active SSH connections."""
    result = subprocess.check_output("sudo lsof -i | grep 'ssh'", shell=True).decode('utf-8')
    connections = [line.split() for line in result.split('\n') if line]
    return connections

def parse_ip_route(output):
    """Parse the IP routing table from the provided output."""
    routes = []
    for line in output.split('\n'):
        if line:
            routes.append(line.split())
    return routes