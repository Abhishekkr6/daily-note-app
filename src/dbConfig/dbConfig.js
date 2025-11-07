import { error, log } from "console";
import mongoose from "mongoose";

let isConnected = false;

export async function connect() {
    if (isConnected) {
        // Already connected
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log('MongoDB Connected');
    } catch (err) {
        console.log("MongoDB connection error, please make sure db is up and running: " + err);
        throw err;
    }
}

// Default export for modules that import the connector as default
export default connect;