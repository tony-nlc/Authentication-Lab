const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require("../middleware/checkAuth");

let activeSessions = [];

router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    if (!activeSessions.some(session => session.sessionID === req.sessionID)) {
      activeSessions.push({
        sessionID: req.sessionID,
        userID: req.session.passport.user, 
      });
    }
  } else {
    activeSessions = activeSessions.filter(session => session.sessionID !== req.sessionID);
  }
  console.log(activeSessions);
  next();
});

router.get("/", (req, res) => {
  res.send("Welcome");
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    user: req.user,
  });
});

router.get("/admin", isAdmin, (req, res) => {
  if (req.isAuthenticated()) {
    res.render("admin", {
      user: req.user,
      activeSessions: activeSessions,
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/admin/revoke-session/:sessionID", isAdmin, (req, res) => {
  const sessionID = req.params.sessionID;

  const sessionToRevoke = activeSessions.find(session => session.sessionID === sessionID);

  if (!sessionToRevoke) {
    return res.status(404).send("Session not found");
  }

  activeSessions = activeSessions.filter(session => session.sessionID !== sessionID);

  req.sessionStore.destroy(sessionID, (err) => {
    if (err) {
      return res.status(500).send("Error destroying session");
    }
    res.redirect("/admin"); 
  });
});


module.exports = router;
