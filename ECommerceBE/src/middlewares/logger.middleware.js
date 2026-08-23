import pinoHttp from "pino-http";
import logger from '../config/logger.js';

const loggerMiddleware = pinoHttp({
    logger,
    autoLogging: {
        ignore: (req) => {
            const url = req.originalUrl || req.url;
            return !url.startsWith("/api/v1");
        }
    },
    serializers: {
        req: () => undefined,
        res: () => undefined,
        err: (err) => ({ message: err.message, stack: err.stack }),
    },
    customSuccessMessage: (req, res, responseTime) => {
        return `${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${responseTime}ms`;
    },
    customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${err.message}`;
    },
    customProps: (req) => ({
        requestId: req.requestId,
    }),
});

export default loggerMiddleware;