const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({

    firstName:{

        type: String,
        require: true
    },
    lastName:{

        type: String,
        require: true
    },
    email:{

        type: String,
        require: true
    },
    allowUser:{
      type: Boolean,
      require: true
    },
    password:{

        type: String,
        require: true
    },
    role:{
        type: String,
        require: true
    }

});
mongoose.set('strictQuery', false);

module.exports = mongoose.model('users', UserSchema);