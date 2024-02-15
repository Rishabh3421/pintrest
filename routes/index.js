// Import necessary modules
var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./pins");
const upload = require("./multer");
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
passport.use(new localStrategy(userModel.authenticate()));

// Use express-flash middleware
router.use(require('express-flash')());

// In your Express app
router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

router.post('/uploads', isLoggedIn, upload.single('image'), async function(req, res) {
  try {
    // Check if the user is logged in (Assuming isLoggedIn middleware checks if the user is authenticated)
    if (!req.isAuthenticated()) {
      return res.redirect("/"); // or handle unauthorized access
    }

    // Find the user based on the session
    const user = await userModel.findOne({ username: req.session.passport.user });

    // Check if the user is found
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Set the profileImage property of the user to the uploaded file's filename
    user.profileImage = req.file.filename;

    // Save the changes to the user object in the database
    await user.save();

    // Redirect the user to their profile page
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Display login form
router.get('/', function(req, res) {
  res.render('index', { messages: req.flash('error'), nav:false });
});

router.get('/home', function(req, res) {
  res.render('home', { messages: req.flash('error'), nav:true });
});

router.get('/createpin', isLoggedIn, async function(req, res) {
  try {
    // Assuming your user data is retrieved from the database
    const user = await userModel.findOne({ username: req.session.passport.user });

    // Check if the user is found
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Render the profile page with the user object
    res.render('createpin', { user: user, nav:true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/createpost', isLoggedIn,upload.single("postImage"),async function(req, res) {

    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postModel.create({
      user:user._id,
      title:req.body.title,
      description:req.file.description,
      image:req.file.filename,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
});

router.post('/createpost', isLoggedIn, upload.single("postImage"), async function(req, res) {
  try {
      const user = await userModel.findOne({ username: req.session.passport.user });
      const post = await postModel.create({
          user: user._id,
          title: req.body.title,
          description: req.body.description,  // Change to req.body.description
          image: req.file.filename,
      });
      user.posts.push(post._id);
      await user.save();
      res.redirect("/profile");
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/profile', isLoggedIn, async function(req, res) {
  try {
    // Assuming your user data is retrieved from the database
    const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts")

    // Check if the user is found
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('profile', { user: user, nav:true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/feed', isLoggedIn, async function(req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const posts = await postModel.find().populate("user");

    res.render("feed", { user, posts, nav: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Display registration form
router.get('/register', function(req, res) {
  res.render('register', {nav:false});
});

// Handle registration
router.post('/register', (req, res) => {
  const userData = new userModel({
    username: req.body.username,
    fullname: req.body.fullname,
    email: req.body.email,
    password: req.body.password,
  });

  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile');
      });
    })
    .catch(function (err) {
      // Handle registration error
      console.error(err);
      req.flash('error', 'Error during registration. Please try again.');
      res.redirect('/register');
    });
});

// Handle login
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      req.flash('error', 'Invalid username or password. Please try again.');
      return res.redirect('/');
    }

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }

      return res.redirect('/profile');
    });
  })(req, res, next);
});

// Handle logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect("/");
});

// Middleware to check if the user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

// Export the router
module.exports = router;
