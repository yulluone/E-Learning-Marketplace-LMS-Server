const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const Utils = require("../utils/auth");
const User = require("../models/user");

passport.use(
  new localStrategy(
    "login",
    new localStrategy((req, res) => {
      const { username, password } = req.body;
      console.log(username);
      let user = User.findOne({ username })
        .then((user) => {
          if (!user) return null, false, { emailErr: "Invalid email address" };
          let validate = Utils.comparePassword(password, user.password)
            .then((validate) => {
              if (validate) {
                return null, true, { authSuccess: "authentication successful" };
              } else if (!validate) {
                return null, false, { passwordErr: "Invalid password" };
              }
            })
            .catch(err)((err) => {
            return err, false, { err: err.message };
          });
        })
        .catch((err) => {
          return err, false, { err: err.message };
        });
    })
  )
);
