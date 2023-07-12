const express = require('express');
const tourController = require('../controllers/tourController');
// const { getTours, getTour, addTour, updateTour, deleteTour } = require('./../controllers/tourController');

const router = express.Router();

router
  .route('/cheapest-5-tours')
  .get(tourController.aliesTopTours, tourController.getTours);

router.route('/').get(tourController.getTours).post(tourController.createTour);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .patch(tourController.updateTour)
  .get(tourController.getTour)
  .delete(tourController.deleteTour);

module.exports = router;
