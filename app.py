from flask import Flask, render_template, flash, jsonify, send_from_directory, request, redirect, url_for
import os
import subprocess
import requests

# Local module imports
from user_management import manage_users, fetch_users, delete_user, get_user_details
from ssh_management import generate_ssh_key, get_keys, delete_key, get_private_key
from network_operations import network_info, network_data, get_lsof_status, get_ss_status, get_client_command

app = Flask(__name__, static_folder="static", template_folder="static")
app.secret_key = "supersecretkey"  # Ideally, this should be in a config or environment variable

# Register routes
app.add_url_rule('/', 'index', lambda: render_template('index.html'))
app.add_url_rule('/users', 'manage_users', manage_users, methods=['GET', 'POST'])
app.add_url_rule('/fetch-users', 'fetch_users', fetch_users)
app.add_url_rule('/delete-user', 'delete_user', delete_user, methods=['POST'])
app.add_url_rule('/key-manager', 'key_manager', lambda: send_from_directory('static', 'key-manager.html'))
app.add_url_rule('/static/<path:path>', 'serve_static', lambda path: send_from_directory('static', path))
app.add_url_rule('/generate_ssh_key/<username>', 'generate_ssh_key', generate_ssh_key, methods=['POST'])
app.add_url_rule('/get_keys', 'get_keys', get_keys, methods=['GET'])
app.add_url_rule('/delete_key', 'delete_key', delete_key, methods=['POST'])
app.add_url_rule('/get_private_key/<username>/<filename>', 'get_private_key', get_private_key, methods=['GET'])
app.add_url_rule('/network-info', 'network_info', network_info)
app.add_url_rule('/network-data', 'network_data', network_data)
app.add_url_rule('/api/lsof/<port>', 'get_lsof_status', get_lsof_status)
app.add_url_rule('/api/ss/<port>', 'get_ss_status', get_ss_status)
app.add_url_rule('/api/client-command', 'get_client_command', get_client_command)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)
