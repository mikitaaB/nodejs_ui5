const express = require('express');
const bodyParser = require('body-parser');
const db = require("../db");

const personsRouter = express.Router();
personsRouter.use(bodyParser.json());



const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/photos');
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

// const upload = multer({ storage: storage, fileFilter: imageFileFilter});
const upload = multer({ storage: storage, fileFilter: imageFileFilter});




personsRouter.route('/')
.get((req, res, next) => {
    db.query('SELECT * FROM public.persons;', function (err, result) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
            return next(err);
        }
        res.status(200).json(result.rows);
    })
})
.post((req, res, next) => {
    var cols = [req.body.firstname, req.body.middlename, req.body.lastname, req.body.post, req.body.phone, req.body.address];
    db.query('INSERT INTO public.persons(firstname, middlename, lastname, post, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;', cols, function (err, result) {
        if (err) {
            console.log("Error inserting : %s", err);
            res.status(400).send(err);
            return next(err);
        }
        res.status(200).json(result.rows);
    })
});
// .post(upload.single("image_file"), (req, res, next) => {
//     // var cols = [req.body.firstname, req.body.middlename, req.body.lastname, req.body.post, req.body.phone, req.body.address, req.body.image];
//     // console.log(req.body);
//     console.log(req.file);
//     var cols = [req.body.firstname, req.body.middlename, req.body.lastname, req.body.post, req.body.phone, req.body.address, req.file.path];
//     cols[6] = cols[6].slice(cols[6].indexOf('\photos\\'));
//     db.query('INSERT INTO public.persons(firstname, middlename, lastname, post, phone, address, image) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;', cols, function (err, result) {
//         if (err) {
//             console.log("Error inserting : %s", err);
//             res.status(400).send(err);
//             return next(err);
//         }
//         res.status(200).json(result.rows);
//     })
// });

personsRouter.route('/:id')
.get((req, res, next) => {
    const id = parseInt(req.params.id);
    db.query('SELECT * FROM public.persons WHERE id = $1;', [id], function (err, result) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
            return next(err);
        }
        res.status(200).json(result.rows[0]);
    })
})
.put((req, res, next) => {
    var cols = [req.body.firstname, req.body.middlename, req.body.lastname, req.body.post, req.body.phone, req.body.address, req.params.id];
    db.query('UPDATE public.persons SET firstname=$1, middlename=$2, lastname=$3, post=$4, phone=$5, address=$6 WHERE id=$7',
        cols,
        function (err, result) {
            if (err) {
                console.log("Error updating : %s", err);
                res.status(400).send(err);
                return next(err);
            }
            res.status(200).json(result.rows);
    })
})
.delete((req, res, next) => {
    const id = req.params.id;
    db.query('DELETE FROM public.persons WHERE id = $1;', [id], function (err) {
        if (err) {
            console.log("Error deleting : %s", err);
            res.status(400).send(err);
            return next(err);
        }
        res.status(200).json({ message: "Deleted" });
    })
});

module.exports = personsRouter;