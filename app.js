require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//Mongoose
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET_KEY,
  encryptedFields: ['password']
})

const User = mongoose.model('User', userSchema);

//Requests
app.get('/', (req, res) => {
  res.render('home');
});

app.route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result) {
            res.render('secrets');
          } else {
            res.send('Wrong password')
          };
        });
      } else {
        res.send('Wrong email')
      };
    })
  });

app.route('/register')
  .get((req, res) => {
    res.render('register');
  })

  .post((req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      const newUser = new User({
        email: req.body.username,
        password: hash
      });

      newUser.save((err) => {
        if (!err) {
          res.render('secrets');
        } else {
          console.log(err);
        }
      });
    });

  });




app.listen(3000, () => console.log('Server started on port 3000'));