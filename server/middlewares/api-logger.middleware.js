import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class APILogger {
    constructor() {
        this.loggedEndpoints = new Map();
        this.logFilePath = path.join(__dirname, '../api-docs.json');
        this.saveCount = 0;
        console.log('📝 API Logger initialized');
        this.loadExistingLogs();
    }

    loadExistingLogs() {
        try {
            if (fs.existsSync(this.logFilePath)) {
                const data = fs.readFileSync(this.logFilePath, 'utf8');
                const existing = JSON.parse(data);
                existing.endpoints.forEach(endpoint => {
                    const key = `${endpoint.method}:${endpoint.path}`;
                    this.loggedEndpoints.set(key, endpoint);
                });
                console.log(`📖 Loaded ${this.loggedEndpoints.size} existing endpoints`);
            }
        } catch (error) {
            console.error('❌ Error loading logs:', error);
        }
    }

    saveLogs() {
        try {
            const endpoints = Array.from(this.loggedEndpoints.values());
            const documentation = {
                generatedAt: new Date().toISOString(),
                totalEndpoints: endpoints.length,
                endpoints: endpoints.sort((a, b) => a.path.localeCompare(b.path))
            };

            fs.writeFileSync(
                this.logFilePath,
                JSON.stringify(documentation, null, 2),
                'utf8'
            );

            // Only log occasionally to avoid spam
            this.saveCount++;
            if (this.saveCount % 5 === 0) {
                console.log(`💾 Saved ${endpoints.length} endpoints`);
            }
        } catch (error) {
            console.error('❌ Error saving logs:', error);
        }
    }

    shouldSkipEndpoint(path) {
        const skipPatterns = [
            '/socket.io',
            '/uploads',
            '/favicon.ico',
            '/health',
            /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/
        ];

        return skipPatterns.some(pattern => {
            if (typeof pattern === 'string') {
                return path.includes(pattern);
            }
            return pattern.test(path);
        });
    }

    sanitizeResponse(data) {
        if (!data) return data;

        const sensitiveFields = [
            'password', 'token', 'accessToken', 'refreshToken',
            'secret', 'apiKey', 'privateKey', 'authorization'
        ];

        const sanitize = (obj) => {
            if (Array.isArray(obj)) {
                return obj.map(item => sanitize(item));
            }

            if (obj !== null && typeof obj === 'object') {
                const cleaned = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                        cleaned[key] = '[REDACTED]';
                    } else {
                        cleaned[key] = sanitize(value);
                    }
                }
                return cleaned;
            }

            return obj;
        };

        return sanitize(data);
    }

    logEndpoint(method, path, statusCode, responseBody, requestBody = null, queryParams = null) {
        if (this.shouldSkipEndpoint(path)) {
            return;
        }

        const key = `${method}:${path}`;
        const existing = this.loggedEndpoints.get(key);

        // Skip if already logged with same status
        if (existing && existing.statusCode === statusCode) {
            return;
        }

        const endpointDoc = {
            method,
            path,
            statusCode,
            timestamp: new Date().toISOString(),
            request: {
                body: requestBody ? this.sanitizeResponse(requestBody) : null,
                query: queryParams || null
            },
            response: {
                body: this.sanitizeResponse(responseBody)
            }
        };

        this.loggedEndpoints.set(key, endpointDoc);
        this.saveLogs();
    }
}

const apiLogger = new APILogger();

export const apiLoggerMiddleware = (req, res, next) => {
    const originalJson = res.json;
    console.log("Logging//");

    res.json = function (data) {
        apiLogger.logEndpoint(
            req.method,
            req.path,
            res.statusCode,
            data,
            req.body,
            req.query
        );
        return originalJson.call(this, data);
    };

    next();
};

export default apiLogger;