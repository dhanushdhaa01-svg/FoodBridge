import mongoose from 'mongoose';
import validator from 'validator';

const transformOutput = (doc, ret) => {
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
  return ret;
};

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor reference is required']
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: [100, 'Food name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    foodType: {
      type: String,
      enum: {
        values: ['veg', 'non-veg', 'vegan', 'jain', 'eggetarian'],
        message: 'Food type must be one of: veg, non-veg, vegan, jain, eggetarian'
      },
      required: [true, 'Food type is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [10000, 'Quantity seems too large']
    },
    quantityUnit: {
      type: String,
      enum: {
        values: ['meals', 'kg', 'litres', 'packets', 'pieces'],
        message: 'Quantity unit must be one of: meals, kg, litres, packets, pieces'
      },
      required: [true, 'Quantity unit is required']
    },
    preparedAt: {
      type: Date,
      required: [true, 'Preparation time is required']
    },
    expiryAt: {
      type: Date,
      required: [true, 'Expiry time is required'],
      validate: {
        validator: function (value) {
          if (!this.preparedAt) return true;
          return value > this.preparedAt;
        },
        message: 'Expiry time must be after preparation time'
      }
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required']
    },
    pickupStartTime: {
      type: String,
      required: [true, 'Pickup start time is required'],
      match: [/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/, 'Invalid time format (HH:MM)']
    },
    pickupEndTime: {
      type: String,
      required: [true, 'Pickup end time is required'],
      match: [/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/, 'Invalid time format (HH:MM)']
    },
    address: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit pincode']
    },
    phone: {
      type: String,
      trim: true
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [300, 'Instructions cannot exceed 300 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'claimed', 'completed', 'cancelled', 'expired'],
        message: 'Invalid donation status'
      },
      default: 'available'
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    claimedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'donations',
    toJSON: {
      virtuals: true,
      transform: transformOutput
    },
    toObject: {
      virtuals: true,
      transform: transformOutput
    }
  }
);

donationSchema.index({ donor: 1, status: 1, createdAt: -1 });
donationSchema.index({ status: 1, city: 1, expiryAt: 1 });
donationSchema.index({ claimedBy: 1, status: 1 });
donationSchema.index({ status: 1, expiryAt: 1 });
donationSchema.index({ createdAt: -1 });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
