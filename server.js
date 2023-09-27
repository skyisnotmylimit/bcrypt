//jshint esversion:6
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const encrypt = require("mongoose-encryption");
// const md5 =  require("md5");

const saltRounds = 10;

dotenv.config();
const port = process.env.PORT;
const app = express();
let Schema = mongoose.Schema;
app.use(express.json());

const loginDetail = {
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
};

const loginSchema = new Schema(loginDetail);
// loginSchema.plugin(encrypt,{secret : process.env.SECRET,encryptedFields : ["password"]});

const uri = process.env.MONGO_ATLAS_URL;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((err) => {
    console.log("Error occured with MongoDb connection", err);
  });

const user = mongoose.model("user", loginSchema);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.post("/signup", async (req, res) => {
  const query = await user.find({ username: req.body.username });
  if (query.length == 0) {
    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
      const newUser = new user({
        username: req.body.username,
        password: hash,
      });
      await newUser.save();
      res.status(200).json({ message: "success" });
    });
  } else {
    res.status(200).json({ message: "username already taken" });
  }
});

app.post("/login", async (req, res) => {
  const query = await user.find({ username: req.body.username });
  if (query.length == 0) {
    res.status(200).json({ message: "user does not exist" });
  } else {
    bcrypt.compare(
      req.body.password,
      query[0].password,
      async (err, result) => {
        if (result === true) {
          res.status(200).json({ message: "Success" });
        } else {
          res.status(200).json({ message: "Wrong username or password" });
        }
      }
    );
  }
});

app.listen(port, () => {
  console.log(`Server is live on port ${port}`);
});
