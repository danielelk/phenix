const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  activityType: {
    type: String,
    enum: ["withMembers", "internal"],
    required: true,
  },
  startDate: {
    type: Date,
    required: [true, "Please add a start date and time"],
  },
  endDate: {
    type: Date,
    required: [true, "Please add an end date and time"],
  },
  location: {
    name: String,
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  capacity: {
    type: Number,
    default: 0, // 0 means unlimited
  },
  transportAvailable: {
    type: Boolean,
    default: false,
  },
  transportCapacity: {
    type: Number,
    default: 0,
  },
  accompanist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [
    {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
      status: {
        type: String,
        enum: ["registered", "attended", "absent", "canceled"],
        default: "registered",
      },
      needsTransport: {
        type: Boolean,
        default: false,
      },
      registrationDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  fees: {
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "EUR",
    },
  },
  status: {
    type: String,
    enum: ["planned", "ongoing", "completed", "canceled"],
    default: "planned",
  },
  activityReport: {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    submissionDate: Date,
    content: String,
    attachments: [String],
    attendanceConfirmed: Boolean,
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

ActivitySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

ActivitySchema.methods.hasAvailableSpace = function () {
  if (this.capacity === 0) return true;
  return this.participants.length < this.capacity;
};

ActivitySchema.methods.hasTransportSpace = function () {
  if (!this.transportAvailable) return false;
  if (this.transportCapacity === 0) return true;

  const participantsNeedingTransport = this.participants.filter(
    (p) => p.needsTransport && p.status !== "canceled"
  ).length;

  return participantsNeedingTransport < this.transportCapacity;
};

module.exports = mongoose.model("Activity", ActivitySchema);
