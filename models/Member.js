const mongoose = require("mongoose");
const config = require("../config/config");

const MemberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please add a first name"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Please add a last name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  phone: {
    type: String,
    required: [true, "Please add a phone number"],
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: "France",
    },
  },
  birthDate: {
    type: Date,
    required: true,
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String,
  },
  membershipStatus: {
    type: String,
    enum: ["pending", "active", "inactive", "expired"],
    default: "pending",
  },
  membershipDate: {
    type: Date,
    default: Date.now,
  },
  membershipRenewalDate: {
    type: Date,
  },
  notes: String,
  hasVehicle: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: [config.USER_ROLES.MEMBER, config.USER_ROLES.VOLUNTEER],
    default: config.USER_ROLES.MEMBER,
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "partial", "paid"],
    default: "unpaid",
  },
  paymentHistory: [
    {
      amount: Number,
      date: {
        type: Date,
        default: Date.now,
      },
      method: {
        type: String,
        enum: ["cash", "check", "transfer", "other"],
      },
      reference: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MemberSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

module.exports = mongoose.model("Member", MemberSchema);
