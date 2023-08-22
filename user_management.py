from flask import request, flash, render_template, redirect, url_for
import subprocess

def get_user_details():
    """Retrieve details for all system users."""
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

def manage_users():
    """Manage user addition and list all users."""
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

def fetch_users():
    """Fetch all system users in JSON format."""
    user_details = get_user_details()
    return jsonify(user_details)

def delete_user():
    """Delete the selected users."""
    users_to_delete = request.form.getlist('user-checkbox')
    for user in users_to_delete:
        try:
            subprocess.run(['sudo', 'userdel', user], check=True)
            flash(f"User {user} deleted successfully", "success")
        except subprocess.CalledProcessError:
            flash(f"Failed to delete user {user}", "error")

    return redirect(url_for('manage_users'))
