# Backend Challenge - Email Service API
This folder contains the solution for the email service API challenge from [this link](https://github.com/boilerlabs/backend-challenges/blob/main/challenges/junior/service-email.md).

## Features
- Basic authentication
- Email sending with support for attachments and templated emails (plain text or HTML)
- Proper error handling and input validation
- Logging and monitoring
- Rate limiting

## Implementation details & Decisions
### Rate limiting
I chose to implement the rate limiting logic on the API itself for learning purposes (in a production environment it would probably be on an API Gateway or proxy service) as a layer that comes after requests are authenticated. I built it using Redis since it provides fast data access and high performance. 

### REST API
Rather than using express for setting up a Node.js REST API, I've created it using the "http" package from Node. Why? Because express is unecesary for a project with only 3 endpoints and becuase using the "http" package gives me a lower level view of what libraries such as express are actually built on top of.

## Improvements to make
### Rate limiting
Right now the rate limiting logic stores user authentication tokens in Redis in order to identify requests, but this is a security flaw since a breach of the Redis instance would allow someone to have access to a varierty if authentication tokens. An improvement to make would be to use IP addresses to identify the requests.

## Usage instructions
This API hasn't been deplyed to a live environment, but you can run it locally by adding the required environment variabled specified at ```.env.example``` and running ```yarn dev```