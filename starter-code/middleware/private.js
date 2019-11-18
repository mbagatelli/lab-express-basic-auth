module.exports = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    next(new Error("You need to login to access this page"));
  }
};
