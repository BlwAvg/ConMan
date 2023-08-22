# ConMan
This is a Connection Manager (ConMan). The purpose is to provide a UI for managing revese shells. I will sometimes setup remote shells family memebers machines to connect back to a remote host. I can connect from my machine and jump to this host to do what ever I need to do to fix my family members computer. 

## ****DISCLAIMER**** 
I dont code and have no idea what I am doing. I am not responsible for anything you do with this code or whatever this code does to you, or anything you own. 

## Getting Started
1. Download the files
2. Install PIP  
    "sudo apt install python3-pip"
3. Install flask  
    "pip install Flask"
4. change to the ConMan directory
5. Run the application  
    "sudo python3 app.py"
6. Access the server over http://ip.addr.here.plz  the app uses port 80 

## File Structure:
ConMan/  
|-- python_apps_here.py
|-- favicon.ico  
|-- static/  
|   |-- favicon.ico  
|   |-- static_html_here.html    
|   |-- styles.css  
|   |-- scripts_here.js  
|-- keys/  
|   |-- Users with no Home directory here  

## Notes:
- Do no open this server up to the internet. This has more security holes than a medieval castle under siege.
- The key directory allows users to be made without a home directory and their keys or authorized keys are stored.
- - Modify /etc/ssh/sshd_config and add  
- - AuthorizedKeysFile LocationTo/ConMan/keys/%u
- This assumes "ss" and "ip" commands are installed on the OS
- Installed on Ubuntu Server
- need to run as root (and install flask as root), otherwise when you run the command you may have to enter a password for things that require elevated privilages

## Need to fix:
- I have a user creation page that barely works
-- Fix the "no home directory option"
-- syslog is listed under full accounts and not system accounts
- I have a key management page that barely works
- Really need to add a navigation bar


## Roadmap:
- Create a connection management page
- Fix stuff that dont look gud
- Take the pages to barely functional to kind of functional
- Customizable ssh encryption from the key manager page
