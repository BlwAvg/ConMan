import os
import subprocess

def fetch_users():
    full_users = [user for user in os.listdir('/home') if os.path.isdir(os.path.join('/home', user)) or user == "root"]
    connection_users = [user for user in os.listdir('/opt/ConMan/keys') if os.path.isdir(os.path.join('/opt/ConMan/keys', user))]

    # Return a list of users, with type information
    return [{"username": user, "type": "Full User"} for user in full_users] + [{"username": user, "type": "Connection User"} for user in connection_users]

def fetch_certs_for_user(username):
    # Depending on the user type, determine the directory to look into
    user_dir = ""
    if username == "root" or os.path.exists(os.path.join('/home', username)):
        user_dir = os.path.join('/home', username, '.ssh')
    else:
        user_dir = os.path.join('/opt/ConMan/keys', username)

    # Return list of certificates (assuming they end in .pub for simplicity)
    return [cert for cert in os.listdir(user_dir) if cert.endswith('.pub')]

def run_lsof(ports):
    ports = [str(port) for port in ports]
    cmd = ["sudo", "lsof", "-i"] + [":" + port for port in ports]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # If there's an output, then it's "Connected"
    status = True if result.stdout else False
    return {"status": status, "output": result.stdout.decode('utf-8')}

def run_ss(ports):
    cmd = ["ss", "-tuln"]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output_lines = result.stdout.decode('utf-8').split("\n")

    # Filter lines that contain any of the given ports
    relevant_lines = [line for line in output_lines if any(port in line for port in ports)]
    return {"result": "\n".join(relevant_lines)}

def build_client_command(data):
    # Extracting details from the data
    user = data.get("user")
    remoteClientPort = data.get("remoteClientPort")
    serverPort = data.get("serverPort")
    privateKey = data.get("privateKey")

    # Building the client command
    command = f"ssh -f -N -i {privateKey} -R {serverPort}:localhost:{remoteClientPort} {user}@ServerHostName"
    return {"command": command}

# Other helper functions can be added as needed...
