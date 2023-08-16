# ConMan
This is a Connection Manager (ConMan). The purpose is to provide a UI for managing revese shells. I will sometimes setup remote shells family memebers machines to connect back to a remote host. I can connect from my machine and jump to this host to do what ever I need to do to fix my family members computer. 

## ****DISCLAIMER**** 
I dont code and have no idea what I am doing. I am not responsible for anything you do with this code or whatever this code does to you, or anything you own. 

## Getting Started
1. Download the files
2. Install PIP
    sudo apt install python3-pip
3. Install flask
    pip install Flask
4. change ConMan directory
5. Run the application
    python3 app.py
6. Access the server over http://ip.addr.here.plz  the app uses port 80 

## File Structure:
ConMan/
|-- app.py
|-- static/
|   |-- favicon.ico
|   |-- index.html
|   |-- users.html
|   |-- key-manager.html
|   |-- styles.css
|   |-- script.js
|-- keys/
|   |-- Users with no Home directory here

## Notes:
The key directory allows users to be made without a home directory and their keys or authorized keys are stored.
	- Modify /etc/ssh/sshd_config
AuthorizedKeysFile LocationTo/ConMan/keys/%u


## What exists:
- I have a user creation page that barely works
- I have a key management page that barely works

## Roadmap:
- Create a connection management page
- Fix stuff that dont look gud
- Take the pages to barely functional to kind of functional
