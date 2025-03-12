import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb://food1User:strongPassword123@192.168.182.41:27017/food1?authSource=food1",
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
