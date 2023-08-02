const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//The signup is kind of a special endpoint that doesn't fit the REST architecture.
//These route are for the user himself.
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//These routes are for the system adminstrator if he or they wanted to update or delete a user base on his/hers ID.
router
  .route('/')
  .get(userController.getUsers)
  .get(userController.getUser)
  .post(userController.createUser);

router
  .route('/:id')
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
