const ChallengeTable = require('./challenges.maria.model');
const Challenge = require('./challenges.mongo.model');
const UndefinedError = require('../errors/UndefinedError');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const WrongFormatError = require('../errors/WrongFormatError');

/*
 * @param {number} id, challenge id
 * @param {object} file, file content to save
 */
const checkFileProperty = async (id, file) => {
  if (!file || !id) throw new UndefinedError();
  if (
    !file.fieldname ||
    !file.originalname ||
    !file.encoding ||
    !file.mimetype ||
    !file.buffer ||
    !file.size
  )
    throw new ValidationError('Missing file fields');
  return true;
};

/*
 * @param {db} can be either 'mongo' or 'maria', default value 'mongo'
 * @param {id} is the identification of one of the db
 */
const findOne = async (id, db = 'mongo') => {
  switch (db) {
    case 'mongo': {
      const mongoChallenge = await Challenge.findById(id);
      if (!mongoChallenge)
        throw new NotFoundError(`Challenge with mongodb ${id} not found`);
      return mongoChallenge;
    }
    case 'maria': {
      const mariaChallenge = await ChallengeTable.findByPk(id);
      if (!mariaChallenge)
        throw new NotFoundError(`Challenge with mariadb id ${id} not found`);
      return mariaChallenge;
    }
    default: {
      throw new ValidationError(
        'Database dialect not understood either "maria" or "mongo"'
      );
    }
  }
};

const createOne = async (authorId, challengeData) => {
  if (!authorId || !challengeData) throw new UndefinedError();

  const result = {};

  // Mongo challence creation
  const challenge = new Challenge({
    author: authorId,
    ...challengeData
  });
  await challenge.save();
  result.mongo = await findOne(challenge.id, 'mongo');
  // Maria challenge creation

  const challengeMaria = await ChallengeTable.create({
    author: authorId,
    mongo_challenge_id: challenge.id
  });
  result.maria = challengeMaria;
  return result;
};

const getAllChallenges = async () => {
  const rawChallenges = await Promise.all([
    Challenge.find(),
    ChallengeTable.findAll({})
  ]);
  const mongoResult = rawChallenges[0];
  const mariaResult = rawChallenges[1];

  // Merge results from each databases
  const challenges = mongoResult.map((mongoChallenge) => {
    const mariaId = mariaResult.find((mariaChallenge) => {
      return (
        mariaChallenge.dataValues.mongo_challenge_id ===
        mongoChallenge._id.toString()
      );
    });
    return { id: mariaId.id, ...mongoChallenge._doc };
  });
  return challenges;
};

const findBySequenceId = async (id, mongoObject = false) => {
  if (!id) throw new UndefinedError();
  const maria = await findOne(id, 'maria');
  if (!maria) throw new NotFoundError('Challenge not found');
  try {
    const mongo = await findOne(maria.dataValues.mongo_challenge_id);
    if (!mongo) throw new NotFoundError('Challenge not found');
    return !mongoObject ? { id, ...mongo._doc } : mongo;
  } catch (err) {
    throw new WrongFormatError('Challenge not found');
  }
};

const update = async (id, data) => {
  if (!id) throw new UndefinedError();
  if (!data) throw new WrongFormatError('No new data');
  // Can't change author of the challenge
  if (data.author) delete data.author;
  await Challenge.findOneAndUpdate({ id }, data);
  return await findBySequenceId(id);
};

module.exports = {
  checkFileProperty,
  createOne,
  getAllChallenges,
  findBySequenceId,
  update
};