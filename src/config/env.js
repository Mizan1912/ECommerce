import dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV : z.enum(['development','production','test']),
    PORT : z.string(),
    MONGO_URI : z.string(),
    CLIENT_URL : z.string(),
    ACCESS_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRES_IN:z.string(),
    REFRESH_TOKEN_SECRET:z.string(),
    REFRESH_TOKEN_EXPIRES_IN:z.string(),
    MAIL_HOST: z.string(),
    MAIL_PORT: z.string(),
    MAIL_USER: z.string(),
    MAIL_PASS: z.string(),
    MAIL_FROM: z.string(),

});

const parsedEnv = envSchema.safeParse(process.env);

if(!parsedEnv.success){
    console.error("Invalid environment variables");
    console.error(parsedEnv.error.format());
    
    process.exit(1);
}

export default parsedEnv.data;