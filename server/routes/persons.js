const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Persons = require('../models/persons');

const personsRouter = express.Router();

personsRouter.use(bodyParser.json());

personsRouter.route('/')
.get((req,res,next) => {
    Persons.find({})
    .then((persons) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(persons);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    Persons.create(req.body)
    .then((person) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(person);
    }, (err) => next(err))
    .catch((err) => next(err));
});

personsRouter.route('/:personId')
.get((req,res,next) => {
    Persons.findById(req.params.personId)
    .then((person) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(person);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    Persons.findByIdAndUpdate(req.params.personId, {
        $set: req.body
    }, { new: true })
    .then((person) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(person);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {
    Persons.findByIdAndRemove(req.params.personId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = personsRouter;