import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

export const getDataFromToken = (req) => {
    try {
        let token = "";
        if (typeof req === "string") {
            token = req;
        } else if (req && req.cookies && typeof req.cookies.get === "function") {
            token = req.cookies.get("authToken")?.value || "";
        }
        if (!token) throw new Error("Token not found");
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        return decodedToken.id;
    } catch (error) {
        throw new Error(error.message);
    }
};