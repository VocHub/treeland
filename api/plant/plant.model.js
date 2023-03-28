// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var active_status = ['active','closed','deleted','review']
//child schema - Responses
var responsesSchema = new Schema({
    response: {
      type: Schema.Types.ObjectId,
      ref: 'Plant'
    },
    contact_info: {
      type: String,
      required: true,
      trim: true
    }
  })
  // create a schema
var plantSchema = new Schema({
  address: {
    type: String,
    required: function() {
      if (this.type == 'Movement') {
        return false;
      } else{
        return true;
      }
    },
    trim: true
  },
  name: {
    type: String,
    required: false,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  quantity: {
    type: Number,
    required: true
  },
  instant:{
    type: Boolean,
    required: false,
    default: false
  },
  image:{
    type: String,
    required: function() {
      if (this.type == 'Movement') {
        return true;
      } else {
        return false;
      }
    }
  },
  owner_name: {
    type: String,
    required: function() {
      if (this.instant) {
        return true;
      } else {
        return false;
      }
    }
  },
  owner_email: {
    type: String,
    required: function() {
      if (this.instant && this.type == 'Movement') {
        return false;
      }
      else if (this.instant) {
        return true;
      } else {
        return false;
      }
    }
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      if (this.instant) {
        return false;
      } else {
        return true;
      }
    }
  },
  approved: {
    type: Boolean,
    required: false,
    default: true
  },
  //status: ['pending','active','closed','deleted','review']
  status: {
    type: String,
    required: false,
    default: 'active'
  },
  responses: [responsesSchema],
}, {
  timestamps: true
});

//
// indexing for text searches
//
plantSchema.index({
  address: 'text',
  name: 'text',
  type: 'text',
  description: 'text'
}, {
  name: 'Plant text index',
  weights: {
    address: 9,
    name: 10,
    type: 6,
    description: 2
  }
});

plantSchema.pre('save', function(next) {
  if (this.instant && active_status.indexOf(this.status) === -1) {
    //this.approved = false;
    this.status = 'pending';
  }
  next();
});

// the schema is useless so far
// we need to create a model using it
var Plant = mongoose.model('Plant', plantSchema);

// make this available to our users in our Node applications
module.exports = Plant;
