const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name can not be blank']
    },
    email: {
        type: String,
        required: [true, 'Email can not be blank'],
        unique: [true, 'Email already registered'],
        match: [/\S+@\S+\.\S+/, 'Email invalid']
    },
    password: {
        type: String,
        required: true,
    }
})

userSchema.pre('save', async function save(next) {
    if (!this.isModified('password')) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      return next();
    } catch (err) {
      return next(err);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
