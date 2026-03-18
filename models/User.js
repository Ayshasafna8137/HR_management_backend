const mongoose = require("mongoose");


const shopSubscriptionSchema = new mongoose.Schema(
  {
    subscription: {
      type: Boolean,
      default: true
    },
     startDate: {
        type: Date
      },
      endDate: {
        type: Date
      },
  }
);


const adSubscriptionSchema = new mongoose.Schema(
  {
    subscription: {
      type: Boolean,
      default: true
    },
     startDate: {
        type: Date
      },
      endDate: {
        type: Date
      },
  }
);



const userSchema = new mongoose.Schema(
  {
    image: {
       imageUrl: { type: String },
      public_id: { type: String },
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    department:{
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "owner", "staff"],
      default: "user",
    },
    experience: {
      type: String
    },
    gender:{
      type: String
    },
     FcmToken: {
    type: String
    },
    shopId: {
    type: mongoose.Schema.Types.ObjectId, ref: "Shop" 
    },
    proof: {
      imageUrl: { type: String },
        public_id: { type: String },
    },
    isAvailable: {
      type: Boolean,
      default: true
    },

    rating: [{
    count: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  }],
   startDate: {
        type: Date
      },
      endDate: {
        type: Date
      },
   
    shopSubscription: shopSubscriptionSchema,
    adSubscription: adSubscriptionSchema
  },
  { timestamps: true }
);


module.exports = mongoose.model("User", userSchema);
