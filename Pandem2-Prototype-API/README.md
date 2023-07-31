# Pandem2 Prototype-1 API

## Configuration

Project configuration settings need to be specified in the config.json under the dist/config directory.
An example for this configuration file can be found in their related .default file, which can be used as a startup for the actual configuration.

Required properties are marked with `*`.

### `config.json`

- serviceName`*` - Name of the service. API "Server" response header will contain this value
- server`*` - Server configuration
    - hostname`*` - Hostname on which the server will accept requests ("::" value allows connections on any hostname)
    - port`*` - Port on which the server will accept requests
    - apiRoot`*` - Prefix for all API endpoints
    - cors - Cross-Origin Resource Sharing configuration (CORS is disabled by default)
        - enabled - Flag specifying whether CORS is enabled
        - allowOrigins - Array containing allowed origins
        - allowHeaders - Array containing allowed headers
- logging`*` - Logging options (stdout logging is enabled by default)
    - level`*` - Logging level as described [here](https://github.com/winstonjs/winston#logging-levels)
    - fileTransport - Container for logger file transport options (file logging is disabled by default)
        - enabled - Flag specifying whether log messages should be captured in files inside the "logs" directory
        - maxSize - Maximum size in bytes of a log file (required`*` when fileTransport is enabled)
        - maxFiles - Maximum number of files to be used for log rotation (required`*` when fileTransport is enabled)
    - trimRequestResponse - Container for trimming request/response log messages options
        - enabled - Flag specifying whether request/response log messages should trimmed to a maximum length
        - maxLength - Maximum length for request/response information in log messages (required`*` when trimRequestResponse is enabled)
- bcrypt`*` - Bcrypt options
    - saltRounds`*` - bcrypt salt rounds number
- jwt`*` - JWT generation options
    - expirationSeconds`*` - Generated JWT token availability period
    - secret `*` - Secret used for signing generated JWT tokens. Details [here](https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback)
- mongodb`*` - MongoDB database connection options
    - uri`*` - URI of the MongoDB server
    - dbName`*` - Database name
- recaptcha`*` - Google recaptcha options
    - secret_key`*` - secret_key used to verify the Google reCAPTCHA token sent by the client.
- email`*` - Nodemailer options
    - client_host`*` - The client URL, it is used in the email received by users to initiate the password reset process.
    - subject`*` - The default subject to be used in emails sent with Nodemailer. 
    - service`*` - The email service provider. This can be a well-known service name (e.g., "gmail", "outlook", etc.) or a custom SMTP configuration.
    - host`*` - The hostname or IP address of the SMTP server.
    - port`*` - The port number used for SMTP communication.
    - secure`*` - Set this to true if the server requires a secure connection (TLS/SSL), otherwise set it to false.
    - auth`*` - This object contains your email account authentication details.
        -user`*` - Email account username
        -pass`*` - Email account password
- automaticTestDataGeneration`*` - Options for automatic generation of test data
    - enabled`*` - Flag specifying whether automatic generation of test data is enabled
        
## Accessing the API documentation

To access the API documentation access the following path:
- ${SERVER_URL}/${API_ROOT}/api-documentation

## Loading Data into DB

### Setting up the default users (ADMIN, MANAGER, STATISTICIAN, REPORTER)

To create/update the default users, run the following command:

``` sh
$ npm run initDefaultUsers create-users
```

### Load NUTS Data
NUTS data required for the map is currently stored in files under src/resources/nuts. To load the data into the database, 
you will need to send a POST request to ${SERVER_URL}/api/data/nuts. The request should contain a JSON object with the 
property named "type" and the value for this property should be the name of the file to load.

### Generate dummy data
Each resource type has an API exposed to generate dummy data. This API follows the following convention:

URL: ${SERVER_URL}/${API_ROOT}/${DATA_TYPE}/generate-dummy

For more info about these APIs, please check the API documentation.

### Load modelling model configuration
The model configuration file should be automatically loaded on startup.

In case it fails, the model can be manually uploaded sending a POST request to:

- ${SERVER_URL}/${API_ROOT}/modelling/models

The contents of the file located at: `generators/data/modelling/model01.json` have to be provided as the body for the request.

Automatic checks will update the parameter default values in case they change in the modelling API. When modifying the model configuration file, make sure that the parameter values in the file are up to date.
