const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['STOCK', 'OPTION', 'FUTURE'],
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  priceHistory: [
    {
      date: { type: Date, required: true },
      price: { type: Number, required: true },
    },
  ],
  // Asset-specific fields
  strikePrice: {
    type: Number,
    required: function () { return this.type === 'OPTION'; }
  },
  underlyingPrice: {
    type: Number,
    required: function () { return this.type === 'OPTION'; }
  },
  leverage: {
    type: Number,
    required: function () { return this.type === 'FUTURE'; },
    default: 1
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
