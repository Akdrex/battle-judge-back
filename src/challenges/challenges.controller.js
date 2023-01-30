const router = require('express').Router();
const service = require('./challenges.service');
const multer = require('multer');
const logger = require('../utils/logger');
require('dotenv/config');

const FILE_SIZE_LIMIT = 10000000; // file size limit 10mb

const multerFilter = (req, file, done) => {
  // TO-DO
  done(null, true);
};
const upload = multer({ fileFilter: multerFilter });

router
  .route('/')
  .get(async (req, res, next) => {
    try {
      return res.status(200).send(await service.getAllChallenges());
    } catch (err) {
      next(err);
    }
  })
  .post(upload.single('file'), async (req, res, next) => {
    try {
      const challenge = await service.createOne(
        req.user.id,
        req.body.challenge
      );
      return res.status(200).send(challenge);
    } catch (err) {
      next(err);
    }
  });

router
  .route('/:id')
  .get(async (req, res, next) => {
    try {
      return res
        .status(200)
        .send(await service.findBySequenceId(req.params.id));
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req, res, next) => {
    try {
      return res
        .status(200)
        .send(await service.update(req.params.id, req.body));
    } catch (err) {
      next(err);
    }
  })
  .delete(async (req, res) => {
    // delete challenge {id}
  });

router
  .route('/:id/resources')
  .get(async (req, res) => {
    // retrieve resources of the challenge
  })
  .post(async (req, res) => {
    // add a resource of the challenge
  })
  .put(async (req, res) => {
    // update all resources of the challenge
  })
  .delete(async (req, res) => {
    // delete all resources of the challenge
  });

router
  .route('/:id/resources')
  .post(upload.single('file'), async (req, res) => {
    console.log('[POST] /upload');
    if (!req.file) return res.status(404).send({ message: 'file not found' });
    if (req.file.size > FILE_SIZE_LIMIT)
      return res.status(413).send({ message: 'file too large' });
    if (!req.body) return res.status(400).send({ message: "can't upload" });

    const file = await service.save(req.file);
    if (file) return res.status(200).send({ file, message: 'uploaded' });
    return res.status(400).send({ message: 'error' });
  })
  .get(async (req, res) => {
    logger.info('retrieving resources');
    const file = await service.getAll();
    if (file)
      return res.status(200).send({ files: file, message: 'file available' });
    return res.status(400).send({ message: "can't get files" });
  });

module.exports = router;