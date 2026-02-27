# Credentials Folder

## The purpose of this folder is to store all credentials needed to log into your server and databases. This is important for many reasons. But the two most important reasons is
    1. Grading , servers and databases will be logged into to check code and functionality of application. Not changes will be unless directed and coordinated with the team.
    2. Help. If a class TA or class CTO needs to help a team with an issue, this folder will help facilitate this giving the TA or CTO all needed info AND instructions for logging into your team's server. 


# Below is a list of items required. Missing items will causes points to be deducted from multiple milestone submissions.

# Team 14 Server Credentials

## Server Information
1. Server IP: 18.217.177.101
2. SSH username: ubuntu
3. SSH key: mykeypair.pem (located in this folder)
    <br> If a ssh key is used please upload the key to the credentials folder.

## Database Information
4. Database IP: 18.217.177.101
    <br><strong> NOTE THIS DOES NOT MEAN YOUR DATABASE NEEDS A PUBLIC FACING PORT.</strong> But knowing the IP and port number will help with SSH tunneling into the database. The default port is more than sufficient for this class.
5. Database username: team14
6. Database password: team14@database
7. Database name: team14

## Instructions on how to use the above information.

## To SSH into the server:
```bash
ssh -i mykeypair.pem ubuntu@18.217.177.101
```

## To access the database:
1. SSH into the server using instructions above
2. Then run: mysql -u team14 -p
3. Enter the database password, stated above, when prompted

# Most important things to Remember
## These values need to kept update to date throughout the semester. <br>
## <strong>Failure to do so will result it points be deducted from milestone submissions.</strong><br>
## You may store the most of the above in this README.md file. DO NOT Store the SSH key or any keys in this README.md file.
