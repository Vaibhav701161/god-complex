import { Request } from "express";
interface RequestUser {
    id: string;
    email?: string;
    name?: string;
    emailVerified?: boolean;
}
declare global {
    namespace Express {
        interface Request {
            user?: RequestUser;
            sessionId?: string;
            requestId?: string;
        }
    }
}
export { RequestUser };
