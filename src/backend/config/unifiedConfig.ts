/**
 * Centralized configuration following 'Backend Development Guidelines'.
 * Ensures process.env is never used directly outside this file.
 */
export const config = {
    app: {
        port: Number(process.env.PORT) || 3000,
        env: process.env.NODE_ENV || 'development',
    },
    supabase: {
        url: process.env.VITE_SUPABASE_URL!,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET!,
    },
    sentry: {
        dsn: process.env.SENTRY_DSN!,
    },
    database: {
        url: process.env.DATABASE_URL!, // Prisma connection string
    }
};
