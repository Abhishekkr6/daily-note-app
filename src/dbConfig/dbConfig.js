import mongoose from "mongoose";

let isConnected = false;

export async function connect() {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log('MongoDB Connected');
    } catch (err) {
        console.error("Database connection failed:", err);
        throw err;
    }
}

export default connect;