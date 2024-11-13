const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userController = require("../controllers/userController");
const GitHubStrategy = require("passport-github").Strategy;
const database = require("../models/userModel");

const localLogin = new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password",
    },
    (email, password, done) => {
        const user = userController.getUserByEmailIdAndPassword(
            email,
            password
        );
        return user
            ? done(null, user)
            : done(null, false, {
                  message: "Your login details are not valid. Please try again",
              });
    }
);

passport.use(
    new GitHubStrategy(
        {
            clientID: "Ov23ligFwUqvF8pp8aqu",
            clientSecret: "2b8623c387cd5ae5839b942fdd7f0688cb38aa88",
            callbackURL: "http://localhost:8000/auth/github/callback",
        },
        function (accessToken, refreshToken, profile, done) {
          const exist = userController.getUserById(profile.id);

          let user;
          if (exist) {
              user = userController.getUserByEmailIdAndPassword(
                  profile.username,
                  profile.username
              );
          } else {
              const newUser = {
                  id: parseInt(profile.id),
                  name: profile.username,
                  email: profile.username,
                  password: profile.username,
                  role: "admin"
              };
              database.database.push(newUser);
              user = newUser;
          }
          
          return user
              ? done(null, user)
              : done(null, false, {
                    message: "Your login details are not valid. Please try again",
                });
        }
    )
);
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    let user = userController.getUserById(id);
    if (user) {
        done(null, user);
    } else {
        done({ message: "User not found" }, null);
    }
});

module.exports = passport.use(localLogin);
