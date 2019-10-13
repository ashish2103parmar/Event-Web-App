Demo Web App

* Prerequisites
1. Set up AWS Account

2. Set up Environment

    a. Install AWS CLI, Node.js, React.js and other dependencies

    b. Configure aws credentials

    c. Setup Node.js Project
        Install Graphql, Express

    d. Setup React.js Project

* AWS Resources
1. Dynamodb Setup

    a. Events Table (events-db)
        partition key   : eventid
        gobal secondary index (start-index) : start_timestamp
                              (email-index) : email
        ttl             : expire_timestamp

    b. User/Session Table (users-db)
        partition key   : userid
        sort key        : dtype (data type)
        gobal secondary index (email-index) : email
        ttl             : expire_timestamp

2. S3
    a. Front-End Application Bucket
    b. Image Bucket

3. ACM SSL Configure

4. ELB - EC2 Configure

5. CloudFront Configure

6. Route 53 Configure

* Application
1. API server
    Express + GraphQL

2. Front-End
    React.js with Material-ui