const mongoose = require("mongoose");

const FinancialSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["income", "expense", "funding", "subscription"],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: [true, "Please add an amount"],
  },
  currency: {
    type: String,
    default: "EUR",
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  date: {
    type: Date,
    required: [true, "Please add a date"],
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "check", "transfer", "card", "other"],
    required: true,
  },
  reference: String,
  relatedTo: {
    type: {
      type: String,
      enum: ["activity", "member", "general", "funding"],
      default: "general",
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
  documents: [String],
  notes: String,
  isMilestone: {
    type: Boolean,
    default: false,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "annually"],
    },
    nextDate: Date,
    endDate: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

FinancialSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Financial", FinancialSchema);
