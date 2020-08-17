const express = require("express");
const router = express.Router();
const db = require("../models");
const { verifyToken } = require("../client/src/utils/tokenHelper");

// Find all excursions
router.get("/api/excursions/all", (req, res) => {
  db.Excursion.find({})
    .then(excursionData => {
      res.json({
        error: false,
        data: excursionData,
        message: "Successfully retrieved all excursion data.",
      });
    })
    .catch(err => {
      res.status(500).json({
        error: true,
        data: null,
        message: "Error retrieving excursion data.",
      });
    });
});

router.get("/api/excursions", (req, res) => {
  try {
    verifyToken(req.headers.auth);
    let userId = verifyToken(req.headers.auth).data;
    db.User.findOne({ _id: userId })
      .populate("excursions")
      .then(userData => {
        res.status(200).json({
          error: false,
          data: userData,
          message: "Successfully retrieved user's excursions.",
        });
      })
      .catch(err => {
        res.status(500).json({
          error: true,
          data: null,
          message: "Error retrieving user's excursions.",
        });
      });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      error: true,
      data: null,
      message: "Cannot retrieve excursions.",
    });
  }
});

// Find an excursion and populate existing items
router.get("/api/excursions/:id", (req, res) => {
  db.Excursion.findOne({ _id: req.params.id })
    .populate("items")
    .then(excursionData => {
      res.json({
        error: false,
        data: excursionData,
        message: "Successfully retrieved excursion data.",
      });
    })
    .catch(err => {
      res.status(500).json({
        error: true,
        data: null,
        message: "Error retrieving excursion data.",
      });
    });
});

// Create new excursion
router.post("/api/excursions", (req, res) => {
  try {
    verifyToken(req.headers.auth);
    const userId = verifyToken(req.headers.auth).data;
    db.Excursion.create(req.body).then(newExcursionData => {
      const newExcursionId = newExcursionData._id;
      db.User.findOne({ _id: userId }).then(data => {
        const userExcursions = data.excursions;
        userExcursions.push(newExcursionId);
        const newExcursionList = { excursions: userExcursions };
        db.User.findOneAndUpdate({ _id: userId }, newExcursionList, {
          new: true,
          useFindAndModify: false,
        })
          .populate("items")
          .populate("excursions")
          .then(({ firstName, lastName, items, excursions }) => {
            const updatedUser = {
              firstName: firstName,
              lastName: lastName,
              items: items,
              excursions: excursions,
            };
            res.json({
              error: false,
              data: updatedUser,
              message: "Successfully added new excursion.",
            });
          })
          .catch(err => {
            res.status(500).json({
              error: true,
              data: null,
              message: "Error adding new excursion to database.",
            });
          });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(401).send("Error :" + error);
  }
});

router.put("/api/excursions/:id", (req, res) => {
  db.Excursion.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    useFindAndModify: false,
  })
    .populate("items")
    .then(excursionData => {
      res.json({
        error: false,
        data: excursionData,
        message: "Successfully updated excursion data.",
      });
    })
    .catch(err => {
      res.status(500).json({
        error: true,
        data: null,
        message: "Error updating excursion data.",
      });
    });
});

// Delete an excursion
router.delete("/api/excursions/:id", (req, res) => {
  try {
    verifyToken(req.headers.auth);
    const userId = verifyToken(req.headers.auth).data;
    db.Excursion.findOneAndDelete({ _id: req.params.id })
      .then(excursionData => {
        const deletedExcursion = excursionData._id;
        db.User.findOne({ _id: userId }).then(userData => {
          const excursionList = userData.excursions;
          const newExcursionList = excursionList.filter(
            excursion =>
              JSON.stringify(excursion) != JSON.stringify(deletedExcursion)
          );
          const updatedExcursionList = { excursions: newExcursionList };
          db.User.findOneAndUpdate({ _id: userId }, updatedExcursionList, {
            new: true,
            useFindAndModify: false,
          })
            .populate("items")
            .populate("excursions")
            .then(({ firstName, lastName, items, excursions }) => {
              const updatedUser = {
                firstName: firstName,
                lastName: lastName,
                items: items,
                excursions: excursions,
              };
              res.json({
                error: false,
                data: updatedUser,
                message: "Successfully deleted excursion data.",
              });
            });
        });
      })
      .catch(err => {
        res.status(500).json({
          error: true,
          data: null,
          message: "Error deleting excursion data.",
        });
      });
  } catch (error) {
    console.error(error);
    res.status(401).send("Error :" + error);
  }
});

module.exports = router;
