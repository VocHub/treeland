// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//child schema - Responses

var imageSchema = new Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  meta: {
    height: {
      type: Number
    },
    width: {
      type: Number
    }
  }

})
// create a schema
var postSchema = new Schema({
  subject: {
    type: String,
    required: false,
    trim: true
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  images: [imageSchema],
  discussion_id: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: function() {
      if (this.type === 'post') {
        return false;
      } else {
        return true
      }
    }
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: function() {
      if (this.type === 'post') {
        return false;
      } else {
        return true
      }
    }
  },
  //type: ['post', 'comment']
  type: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  top: {
    type: Boolean,
    required: false,
    default: false
  }
}, {timestamps: true});

//
// indexing for text searches
//
postSchema.index({
  subject: 'text',
  body: 'text',
  //type: 'text',
  //description: 'text'
}, {
  name: 'Plant text index',
  weights: {
    body: 9,
    subject: 10,
    //type: 6,
    //description: 2
  }
});

// the schema is useless so far
// we need to create a model using it
var Post = mongoose.model('Post', postSchema);

// make this available to our users in our Node applications
module.exports = Post;
