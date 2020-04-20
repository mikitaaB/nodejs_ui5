const db = require("../db");

exports.getPersons = (req, res, next) => {
    db.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
            return next(err);
        }
        client.query('SELECT * FROM public.persons;', function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
                return next(err);
            }
            res.status(200).json(result.rows);
        })
    });
};

exports.getPersonById = (req, res) => {
    const id = parseInt(req.params.id);
    db.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
            return next(err);
        }
        client.query('SELECT * FROM public.persons WHERE id = $1;', [id], function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
                return next(err);
            }
            res.status(200).json(result.rows[0]);
        })
    });
};

exports.postPerson = (req, res) => {
    var cols = [req.body.firstname, req.body.middlename, req.body.lastname, req.body.post, req.body.phone, req.body.address];
    db.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
            return next(err);
        }
        client.query('INSERT INTO public.persons(firstname, middlename, lastname, post, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;', cols, function (err, result) {
            done();
            if (err) {
                console.log("Error inserting : %s", err);
                res.status(400).send(err);
                return next(err);
            }
            res.status(200).json(result.rows);
        })
    });
};

exports.putPerson = (req, res) => {
    var cols = [req.body.firstname, req.body.middlename, req.body.lastname, req.body.post, req.body.phone, req.body.address, req.params.id];
    db.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
            return next(err);
        }
        client.query('UPDATE public.persons SET firstname=$1, middlename=$2, lastname=$3, post=$4, phone=$5, address=$6 WHERE id=$7',
            cols,
            function (err, result) {
                done();
                if (err) {
                    console.log("Error updating : %s", err);
                    res.status(400).send(err);
                    return next(err);
                }
                res.status(200).json(result.rows);
        })
    });
};

exports.deletePerson = (req, res) => {
    const id = req.params.id;
    db.connect(function (err, client, done) {
        if (err) {
            console.log('Can not connect to the DB' + err);
            return next(err);
        }
        client.query('DELETE FROM public.persons WHERE id = $1;', [id], function (err) {
            done();
            if (err) {
                console.log("Error deleting : %s", err);
                res.status(400).send(err);
                return next(err);
            }
            res.status(200).json({ message: "Deleted" });
        })
    });
};