import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

export const getDataFromToken = (req) => {
    try {
        // Read the correct cookie name set by login API
        const token = req.cookies.get("authToken")?.value || "";
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        return decodedToken.id;
    } catch (error) {
        throw new Error(error.message);
    }
};