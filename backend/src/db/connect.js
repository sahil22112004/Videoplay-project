import mongoose from 'mongoose';
import { db_name } from './database_name.js';

const connectdb = async()=>{
try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}${db_name}?retryWrites=true&w=majority&appName=Sahil`)
    console.log(`✅ MongoDB connected: ${connectionInstance.connection.host}`)
} catch (error) {
    console.log(error)
    
}
}
export default connectdb;