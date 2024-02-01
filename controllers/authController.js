const { PrismaClient } = require("@prisma/client");
const { router } = require("../app");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

const createToken = async (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    const token = await createToken(user.id);
    const passwordValid = argon2.verify(user.password, password);
    if (!passwordValid) {
      res.status(400).json({
        status: "fail",
        message: "Incorrect password",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      status: "fail",
      message: error,
    });
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { email, password, name, phone, address, description } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({
        status: "fail",
        message: "Email, password and name are required",
      });
    }
    const hash = await argon2.hash(password);
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      res.status(400).json({
        status: "fail",
        message: "Email already exists",
      });
    }
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name,
      },
    });
    const token = await createToken(user.id);
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};
