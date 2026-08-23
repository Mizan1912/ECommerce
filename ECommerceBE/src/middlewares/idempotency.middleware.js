import Idempotency from './../models/Idempotency.model.js';
import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';

const idempotencyMiddleware = async (req, res, next) => {
    const key = req.headers["idempotency-key"];

    if (!key) {
        return next();
    }

    try {
        // Hash the request body to ensure key is not reused for different content
        const bodyString = req.body ? JSON.stringify(req.body) : '';
        const requestHash = crypto.createHash("sha256").update(bodyString).digest("hex");

        const existing = await Idempotency.findOne({ key });

        if (existing) {
            if (existing.state === "in-flight") {
                return next(new ApiError(409, "A request with this idempotency key is already in progress"));
            }

            if (existing.requestHash === requestHash) {
                // Replay the cached response
                return res.status(existing.statusCode).json(existing.response);
            } else {
                return next(new ApiError(422, "Idempotency key was reused with a different request body"));
            }
        }

        // Key not seen before: create an in-flight lock record
        await Idempotency.create({
            key,
            requestHash,
            statusCode: 200, // Default, updated on send
            state: "in-flight"
        });

        // Intercept response send to cache response status and body
        const originalSend = res.send;
        let saved = false;

        res.send = function (body) {
            if (!saved) {
                saved = true;
                const status = res.statusCode;
                let parsedBody;
                try {
                    parsedBody = JSON.parse(body);
                } catch (e) {
                    parsedBody = body;
                }

                if (status >= 200 && status < 500) {
                    Idempotency.updateOne(
                        { key },
                        {
                            statusCode: status,
                            response: parsedBody,
                            state: "completed"
                        }
                    ).catch(err => console.error("Error saving idempotency response:", err));
                } else {
                    // For 5xx server errors, remove the lock so that the request can be retried
                    Idempotency.deleteOne({ key }).catch(err => console.error("Error removing in-flight key on server failure:", err));
                }
            }
            return originalSend.apply(res, arguments);
        };

        req.idempotencyKey = key;
        next();
    } catch (error) {
        next(error);
    }
};

export default idempotencyMiddleware;