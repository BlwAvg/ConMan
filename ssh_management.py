from flask import jsonify, request
import os
import subprocess

def generate_ssh_key(username):
    """Generate an SSH key for the specified username."""
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

def get_keys():
    """Retrieve all SSH keys."""
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

def delete_key():
    """Delete the specified SSH keys."""
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

def get_private_key(username, filename):
    """Retrieve the private SSH key for the given username and filename."""
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
