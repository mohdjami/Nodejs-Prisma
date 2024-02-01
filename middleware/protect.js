exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(401).json({
        status: "fail",
        message: "You are not logged in",
      });
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });
    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      status: "fail",
      message: error,
    });
  }
};
