const mongoose = require("mongoose");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Q. WHY HASH THE PASSWORD IN A PRE-SAVE HOOK INSTEAD OF IN THE CONTROLLER?
// ANS: A hook guarantees the password can never reach the database in plain
// text no matter which code path saves the user (register, a future
// password-reset flow, a seed script, etc.) - the controller would have to
// remember to hash it every single time, and one missed call site would leak
// plaintext passwords. isModified("password") guards against re-hashing an
// already-hashed password on unrelated updates (e.g. saving after an email
// change), which would otherwise break login by hashing the hash.
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await argon2.hash(this.password);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (error) {
    throw error;
  }
};

userSchema.index({ username: "text" });

const User = mongoose.model("User", userSchema);
module.exports = User;
