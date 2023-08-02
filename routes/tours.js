const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const { getTours, getTour, addTour, updateTour, deleteTour } = require('./../controllers/tourController');

const router = express.Router();

router
  .route('/cheapest-5-tours')
  .get(tourController.aliasTopTours, tourController.getTours);

router
  .route('/')
  .get(authController.protect, tourController.getTours)
  .post(tourController.createTour);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .patch(tourController.updateTour)
  .get(tourController.getTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
