import mongoose from 'mongoose';
import validator from 'validator';

const transformOutput = (doc, ret) => {
  ret.id = ret._id;
  delete ret._id;
  delete ret.password;
  delete ret.__v;
  return ret;
};

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email address'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number']
    },
    role: {
      type: String,
      enum: {
        values: ['donor', 'ngo', 'admin'],
        message: 'Role must be one of: donor, ngo, admin'
      },
      required: [true, 'Role is required']
    },
    // organizationName is required only for NGO accounts (role === 'ngo')
    organizationName: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.role === 'ngo';
        },
        'Organization name is required for NGO accounts'
      ]
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
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
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'users',
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

const User = mongoose.model('User', userSchema);

export default User;