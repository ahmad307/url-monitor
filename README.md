# Url Monitor

Url Monitor is a web API for monitoring website availability, outages and uptime.


## Installation

- Make sure [NodeJS](https://nodejs.org/en/download/) is installed on your system.
- Under the project main directory run: ```npm install``` to install all required packages.
- Add a ```.env``` file and the add the following keys:
    - DB_URL: Url to a MongoDB cloud database.
    - SESSIONS_SECRET: A secret key for session authentication.
    - EMAIL, PASSWORD: Email and password to be used in sending email notifications. 