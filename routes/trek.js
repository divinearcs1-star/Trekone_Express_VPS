require('dotenv').config();
const express = require('express');
const router = express.Router();   // Create route handler
const Trek = require('../models/trek');
const verifyToken = require('../middlewares/auth');
const verifyAdmin = require('../middlewares/adminAuth');

router.get('/allTrek', async (req, res) => {
  try {
    console.log("In trek");
    const data = await Trek.find({});

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching treks' });
  }
});

router.get('/filterTrek', async (req, res) => {
  try {
    console.log("In filter trek");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const data = await Trek.aggregate([
      {
        $project: { _id: 1, eventName: 1, fees:1 ,coverImage: 1, difficulty: 1, duration: 1, trekFrom: 1,
          batches: { $filter: { input: "$batches", as: "batch",
              cond: {$and: [ { $gte: ["$$batch.eventDate", today] },
                  { $eq: ["$$batch.status", "Active"] }
                ]}}}}
      },
      {
        $match: {
          "batches.0": { $exists: true }}
      },
      {
        $project: {
          _id: 1, eventName: 1, fees:1 , coverImage: 1,difficulty: 1, duration: 1, trekFrom: 1,
          batches: { $sortArray: { input: "$batches", sortBy: { eventDate: 1 }}}}}
    ]);
    // console.log(data)
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching filter treks' });
  }
});

router.get('/specialTrek', verifyToken, async (req, res) => {
  try {
    console.log("In specialtrek");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const data = await Trek.aggregate([
  {
    $project: {
      _id: 1,eventName: 1,altitude: 1, description: 1, coverImage: 1,difficulty: 1,duration: 1,trekFrom: 1,specialEvent: 1,
      batches: {$filter: {input: "$batches",as: "batch",cond: {
            $and: [{ $gte: ["$$batch.eventDate", today] },{ $eq: ["$$batch.status", "Active"] }]}}}}},
  { $match: {specialEvent: true,"batches.0": { $exists: true }}},
  { $project: {
      _id: 1,eventName: 1,altitude: 1 ,description:1 ,coverImage: 1,difficulty: 1,duration: 1,trekFrom: 1,specialEvent: 1,
      batches: {$sortArray: {input: "$batches",sortBy: { eventDate: 1 }}}}}
]);
    // console.log(data);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching special treks' });
  }
});

module.exports = router;
