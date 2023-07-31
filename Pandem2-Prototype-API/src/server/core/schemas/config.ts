/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
// static configuration validation schema
export const localConfigValidationSchema = {
  type: 'object',
  properties: {
    server: {
      type: 'object',
      properties: {
        hostname: {
          type: 'string',
          minLength: 1
        },
        port: {
          type: 'integer'
        },
        apiRoot: {
          type: 'string',
          minLength: 1
        },
        keepAliveTimeout: {
          description: 'NodeJS server keepAlive timeout; default: 61000',
          type: 'integer',
          minimum: 0
        },
        headersTimeout: {
          description: 'NodeJS server headers timeout; default: 62000',
          type: 'integer',
          minimum: 0
        },
        https: {
          type: 'object',
          properties: {
            server: {
              type: 'object'
            },
            client: {
              type: 'object'
            }
          },
          required: ['server', 'client']
        },
        cors: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean'
            },
            allowOrigins: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'string',
                minLength: 1
              }
            },
            allowHeaders: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'string',
                minLength: 1
              }
            },
          },
          required: ['enabled']
        }
      },
      required: ['hostname', 'port', 'apiRoot', 'cors']
    },
    logging: {
      type: 'object',
      properties: {
        level: {
          enum: ['info', 'debug', 'warn', 'error']
        },
        fileTransport: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean'
            },
            maxSize: {
              type: 'integer',
              minimum: 10000
            },
            maxFiles: {
              type: 'integer',
              minimum: 1
            }
          },
          required: ['enabled']
        }
      },
      required: ['level', 'fileTransport']
    },
    serviceGateway: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          minLength: 1
        },
        credentials: {
          type: 'object',
          properties: {
            clientId: {
              type: 'string',
              minLength: 1
            },
            clientSecret: {
              type: 'string',
              minLength: 1
            }
          },
          required: ['clientId', 'clientSecret']
        },
        timeout: {
          type: 'integer',
          minimum: 1
        }
      }
    },
    serviceName: {
      type: 'string'
    },
    serviceUniqueIdentifier: {
      type: 'string'
    },
    multiInstance: {
      description: 'Multi-instance service identifier properties',
      type: 'object',
      properties: {
        host: {
          description: 'Instance host properties',
          type: 'object',
          properties: {
            ip: {
              description: 'Instance IP',
              type: 'string'
            },
            port: {
              description: 'Instance port',
              type: 'integer'
            }
          },
          required: ['ip', 'port']
        }
      },
      required: ['host']
    },
    mongodb: {
      type: 'object',
      properties: {
        uri: {
          type: 'string',
          minLength: 1
        },
        dbName: {
          type: 'string',
          minLength: 1
        }
      },
      required: [
        'uri',
        'dbName'
      ]
    }
  },
  required: [
    'server',
    'logging',
    'serviceName',
    'serviceUniqueIdentifier',
    'mongodb'
  ]
};
