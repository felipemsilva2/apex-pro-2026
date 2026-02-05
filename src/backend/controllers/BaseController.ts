import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

/**
 * Base Controller providing unified success/error handling.
 */
export abstract class BaseController {
    protected handleSuccess(res: Response, data: any, status: number = 200) {
        res.status(status).json({
            success: true,
            data
        });
    }

    protected handleError(error: any, res: Response, context: string) {
        console.error(`[${context}] Error:`, error);

        // Skill requirement: All errors to Sentry
        Sentry.captureException(error, {
            tags: { context }
        });

        const status = error.status || 500;
        const message = error.message || 'Internal Server Error';

        res.status(status).json({
            success: false,
            error: {
                message,
                code: error.code || 'UNKNOWN_ERROR'
            }
        });
    }
}

/**
 * Async Error Wrapper for Express handlers.
 */
export const asyncErrorWrapper = (fn: (req: Request, res: Response) => Promise<any>) => {
    return (req: Request, res: Response, next: any) => {
        fn(req, res).catch(next);
    };
};
