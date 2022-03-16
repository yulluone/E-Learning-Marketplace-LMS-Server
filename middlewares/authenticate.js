// const passport = require("passport");
// const localStrategy = require("passport-local").Strategy;
// const userModel = require("../models/userSchema");
// const JWTStrategy = require("passport-jwt").Strategy;
// const ExtractJWT = require("passport-jwt").ExtractJwt;

// passport.use(
//   "login",
//   new localStrategy(
//     {
//       usernameField: "email",
//       passwordField: "password",
//     },
//     (email, password, done) => {
//       userModel
//         .findOne({ email: email })
//         .then(
//           (user) => {
//             if (!user)
//               return done(null, false, { emailErr: "Invalid email address" });

//             /*.................nested promise to verify  password....................... */
//             user
//               .isValidPassword(password)
//               .then(
//                 (validate) => {
//                   if (validate) done(null, validate, user);
//                   else if (!validate)
//                     done(null, false, { passErr: "Invalid password" });
//                 },
//                 (err) => done(null, false, { passErr: "incorrect password" })
//               )
//               .catch((err) =>
//                 done(null, false, { passErr: "Incorrect password" })
//               );
//             /*......................end of nested promise..............................*/
//           },
//           (err) => done(null, false, { message: err.message })
//         )
//         .catch((err) => done(null, false, { message: err.message }));
//     }
//   )
// );

// passport.use(
//   "jwt",
//   new JWTStrategy(
//     {
//       secretOrKey: process.env.secret_key,
//       jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//     },
//     async (token, done) => {
//       try {
//         return done(null, token, { message: "Success" });
//       } catch (error) {
//         done(error);
//       }
//     }
//   )
// );
