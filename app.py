from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
import subprocess
import os
import requests

app = Flask(__name__, static_folder="static", template_folder="static")
app.secret_key = "supersecretkey"

def get_user_details():
    users = subprocess.getoutput("cut -d: -f1 /etc/passwd").split("\n")
    user_details = {}

    for user in users:
        home_dir = subprocess.getoutput(f"eval echo ~{user}")
        groups = subprocess.getoutput(f"groups {user}").split(":")[1].strip().split(" ")

        if user == "root" or home_dir.startswith("/home"):
            category = "Full Accounts"
        elif home_dir.startswith("ConMan/keys"):
            category = "Connection Accounts"
        else:
            category = "System Accounts"

        user_details[user] = {"home": home_dir, "groups": groups, "category": category}

    return user_details

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/users', methods=['GET', 'POST'])
def manage_users():
    if request.method == 'POST':
        username = request.form['username']
        no_home = "nohome" in request.form
        cmd = ['sudo', 'useradd']
        if no_home:
            cmd.append('--no-create-home')
        cmd.append(username)

        try:
            subprocess.run(cmd, check=True)
            flash(f"User {username} added successfully", "success")
        except subprocess.CalledProcessError:
            flash(f"Failed to add user {username}", "error")

        return redirect(url_for('manage_users'))

    user_details = get_user_details()
    return render_template('users.html', users=user_details)

@app.route('/fetch-users')
def fetch_users():
    user_details = get_user_details()
    return jsonify(user_details)

@app.route('/delete-user', methods=['POST'])
def delete_user():
    users_to_delete = request.form.getlist('user-checkbox')
    for user in users_to_delete:
        try:
            subprocess.run(['sudo', 'userdel', user], check=True)
            flash(f"User {user} deleted successfully", "success")
        except subprocess.CalledProcessError:
            flash(f"Failed to delete user {user}", "error")

    return redirect(url_for('manage_users'))

@app.route('/key-manager')
def key_manager():
    return send_from_directory('static', 'key-manager.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/generate_ssh_key/<username>', methods=['POST'])
def generate_ssh_key(username):
    home_dir = f'/home/{username}'
    if os.path.exists(home_dir):
        key_dir = f'{home_dir}/.ssh'
    else:
        key_dir = os.path.join(os.getcwd(), 'keys', username)
        if not os.path.exists(key_dir):
            os.makedirs(key_dir)

    key_path = os.path.join(key_dir, 'id_rsa')
    public_key_path = os.path.join(key_dir, 'id_rsa.pub')

    if os.path.exists(public_key_path):
        return jsonify(error=f"SSH key for {username} already exists."), 400

    subprocess.run(['ssh-keygen', '-t', 'rsa', '-f', key_path, '-N', ''])
    return jsonify(success=True)

@app.route('/get_keys', methods=['GET'])
def get_keys():
    keys = []
    for username in os.listdir('/home'):
        key_dir = f'/home/{username}/.ssh'
        if os.path.exists(key_dir):
            for filename in os.listdir(key_dir):
                if filename.endswith('.pub'):
                    with open(f'{key_dir}/{filename}', 'r') as f:
                        public_key = f.read().strip()
                        keys.append({
                            'username': username,
                            'filename': filename,
                            'public_key': public_key,
                            'key_type': 'SSH',
                            'file_path': os.path.join(key_dir, filename) 
                        })

    keys_dir = os.path.join(os.getcwd(), 'keys')
    for username in os.listdir(keys_dir):
        key_dir = os.path.join(keys_dir, username)
        if os.path.exists(key_dir):
            for filename in os.listdir(key_dir):
                if filename.endswith('.pub'):
                    with open(os.path.join(key_dir, filename), 'r') as f:
                        public_key = f.read().strip()
                        keys.append({
                            'username': username,
                            'filename': filename,
                            'public_key': public_key,
                            'key_type': 'SSH',
                            'file_path': os.path.join(key_dir, filename)
                        })

    return jsonify(keys)

@app.route('/delete_key', methods=['POST'])
def delete_key():
    data = request.json
    if not isinstance(data, list):  # Basic type checking
        return jsonify({'success': False, 'message': 'Expected a list of keys'}), 400

    for item in data:
        username = item['username']
        filename = item['filename']
        home_dir = f'/home/{username}'
        if os.path.exists(home_dir):
            key_dir = f'{home_dir}/.ssh'
        else:
            key_dir = os.path.join(os.getcwd(), 'keys', username)

        if os.path.exists(os.path.join(key_dir, filename)):
            os.remove(os.path.join(key_dir, filename))

            if filename.endswith('.pub'):
                private_key = filename[:-4]
                if os.path.exists(os.path.join(key_dir, private_key)):
                    os.remove(os.path.join(key_dir, private_key))

    return jsonify({'success': True, 'message': 'Keys deleted successfully'})

@app.route('/get_private_key/<username>/<filename>', methods=['GET'])
def get_private_key(username, filename):
    home_dir = f'/home/{username}'
    if os.path.exists(home_dir):
        key_dir = f'{home_dir}/.ssh'
    else:
        key_dir = os.path.join(os.getcwd(), 'keys', username)

    private_key_path = os.path.join(key_dir, filename)

    if os.path.exists(private_key_path):
        with open(private_key_path, 'r') as f:
            private_key = f.read().strip()
            return jsonify(private_key=private_key)
    else:
        return jsonify(error="Private key not found."), 404

############ NETWORK INFO PAGE ###############
def parse_ip_addr(output):
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

@app.route('/network-info')
def network_info():
    return send_from_directory('static', 'network-info.html')

@app.route('/network-data')
def network_data():
    data = {}

    # Fetch command outputs
    data['ss_ltua'] = subprocess.check_output("ss -ltua", shell=True).decode('utf-8')
    data['ss_s'] = subprocess.check_output("ss -s", shell=True).decode('utf-8')
    data['ip_route'] = subprocess.check_output("ip route", shell=True).decode('utf-8')

    # Parse interface data 
    ip_addr_output = subprocess.check_output("ip addr", shell=True).decode('utf-8')
    data['ip_addr'] = parse_ip_addr(ip_addr_output)

    # Fetch default gateway
    ip_route_output = subprocess.check_output("ip route", shell=True).decode('utf-8')
    default_gateway = next((line.split()[-3] for line in ip_route_output.split('\n') if line.startswith('default')), None)
    data['default_gateway'] = default_gateway

    # Fetch DNS servers
    with open('/etc/resolv.conf', 'r') as f:
        lines = f.readlines()
    dns_servers = [line.split()[-1] for line in lines if line.startswith('nameserver')]
    data['dns_servers'] = dns_servers

    # Fetch public IP
    data['public_ip'] = requests.get('https://icanhazip.com').text.strip()

    return jsonify(data)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)
