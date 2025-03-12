import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://Anubhav123:Anubhav@cluster0.c02bl.mongodb.net/",
      {
     
        useUnifiedTopology: true,
      }
    );
    console.log("✅ MongoDB Connected with Authentication");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};
