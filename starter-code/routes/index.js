"use strict";

const { Router } = require("express");
const router = Router();

const User = require("./../models/user");
const bcryptjs = require("bcryptjs");
const privateRoute = require("./../middleware/private");

router.get("/", (req, res, next) => {
  res.render("index");
});

//Sign In
router.get("/sign-in", (req, res, next) => {
  res.render("sign-in");
});

router.post("/sign-in", (req, res, next) => {
  let userId;
  const { name, password } = req.body;
  User.findOne({ name })
    .then(user => {
      if (!user) {
        return Promise.reject(new Error("There's no user with that username"));
      } else {
        userId = user._id;
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then(result => {
      if (result) {
        console.log("Logged in");
        req.session.user = userId;
        res.redirect("/");
      } else {
        return Promise.reject(new Error("Wrong Password."));
      }
    })
    .catch(error => {
      next(error);
    });
});

//Sign up here
router.get("/sign-up", (req, res, next) => {
  res.render("sign-up");
});

router.post("/sign-up", (req, res, next) => {
  const { name, password } = req.body;
  console.log(req.body);
  bcryptjs
    .hash(password, 10)
    .then(hash => {
      return User.create({
        name,
        passwordHash: hash
      });
    })
    .then(user => {
      console.log("Created", user);
      req.session.user = user._id;
      res.redirect("/");
    })
    .catch(error => {
      console.log(error);
      next(error);
    });
});

router.get("/sign-out", (req, res, next) => {
  req.session.destroy(error => {
    res.redirect("/");
  });
});

//Private Pages

router.get("/main", privateRoute, (req, res, next) => {
  res.render("main");
});

router.get("/private", privateRoute, (req, res, next) => {
  res.render("private");
});

router.get("/profile", privateRoute, (req, res, next) => {
  res.render("profile");
});

router.get("/edit", privateRoute, (req, res, next) => {
  res.render("edit");
});

router.post("/edit", privateRoute, (req, res, next) => {
  let userId = req.session.user;
  User.findByIdAndUpdate(userId, {
    realName: req.body.realName
  })
    .then(user => {
      res.redirect("/");
      console.log("User Edited", user, realName);
    })
    .catch(error => {
      console.log(error);
    });
});

module.exports = router;
