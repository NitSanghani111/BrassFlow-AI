"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = parsed.body;
            req.query = parsed.query;
            req.params = parsed.params;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                logger_1.logger.warn(`Validation failed: ${JSON.stringify(error.errors)}`);
                const formattedErrors = error.errors.map((err) => ({
                    field: err.path.slice(1).join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: formattedErrors,
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
