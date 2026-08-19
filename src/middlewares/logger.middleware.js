import pinoHttp from "pino-http";

import logger from '../config/logger.js';

const loggerMiddleware = pinoHttp({
    logger,

    customProps: (req) => ({
    requestId: req.requestId,
    }),
})

export default loggerMiddleware