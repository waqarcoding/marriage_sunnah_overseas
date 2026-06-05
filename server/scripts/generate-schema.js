import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiDocsPath = path.join(__dirname, '../api-docs.json');
const schemaOutputPath = path.join(__dirname, '../api-schema.json');

// Helper to infer JSON Schema type from value
function inferType(value) {
    if (value === null) return { type: 'null' };
    if (Array.isArray(value)) return { type: 'array' };

    const type = typeof value;
    if (type === 'object') return { type: 'object' };
    if (type === 'number') return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
    if (type === 'boolean') return { type: 'boolean' };
    return { type: 'string' };
}

// Generate schema for an object
function generateObjectSchema(obj, name = 'root') {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        return inferType(obj);
    }

    const properties = {};
    const required = [];

    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
            required.push(key);
        }

        if (Array.isArray(value)) {
            if (value.length > 0) {
                properties[key] = {
                    type: 'array',
                    items: generateObjectSchema(value[0], key)
                };
            } else {
                properties[key] = { type: 'array', items: {} };
            }
        } else if (value !== null && typeof value === 'object') {
            properties[key] = generateObjectSchema(value, key);
        } else {
            properties[key] = inferType(value);
        }
    }

    return {
        type: 'object',
        properties,
        ...(required.length > 0 && { required })
    };
}

// Main conversion
try {
    const apiDocs = JSON.parse(fs.readFileSync(apiDocsPath, 'utf8'));

    const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Marriage Sunnah Overseas API',
        description: 'API documentation and schemas',
        type: 'object',
        properties: {
            generatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'When this documentation was generated'
            },
            totalEndpoints: {
                type: 'integer',
                description: 'Total number of documented endpoints'
            },
            endpoints: {
                type: 'array',
                description: 'List of all API endpoints',
                items: {
                    type: 'object',
                    properties: {
                        method: {
                            type: 'string',
                            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                            description: 'HTTP method'
                        },
                        path: {
                            type: 'string',
                            description: 'API endpoint path'
                        },
                        statusCode: {
                            type: 'integer',
                            description: 'HTTP status code'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last tested timestamp'
                        },
                        request: {
                            type: 'object',
                            properties: {
                                body: {
                                    description: 'Request body schema'
                                },
                                query: {
                                    description: 'Query parameters'
                                }
                            }
                        },
                        response: {
                            type: 'object',
                            properties: {
                                body: {
                                    description: 'Response body schema'
                                }
                            }
                        }
                    },
                    required: ['method', 'path']
                }
            }
        }
    };

    // Generate detailed schemas for each endpoint
    const endpointSchemas = {};

    apiDocs.endpoints.forEach(endpoint => {
        const key = `${endpoint.method}_${endpoint.path.replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`;

        endpointSchemas[key] = {
            method: endpoint.method,
            path: endpoint.path,
            statusCode: endpoint.statusCode,
            requestSchema: endpoint.request?.body
                ? generateObjectSchema(endpoint.request.body, 'request')
                : null,
            querySchema: endpoint.request?.query
                ? generateObjectSchema(endpoint.request.query, 'query')
                : null,
            responseSchema: endpoint.response?.body
                ? generateObjectSchema(endpoint.response.body, 'response')
                : null
        };
    });

    const fullSchema = {
        ...schema,
        definitions: {
            endpoints: endpointSchemas
        }
    };

    fs.writeFileSync(schemaOutputPath, JSON.stringify(fullSchema, null, 2));

    console.log('✅ JSON Schema generated successfully!');
    console.log(`📄 Output: ${schemaOutputPath}`);
    console.log(`📊 Schemas for ${Object.keys(endpointSchemas).length} endpoints`);

} catch (error) {
    console.error('❌ Error generating schema:', error);
    process.exit(1);
}