const Joi = require("joi");

const validateCreateComment = (data) => {
  const schema = Joi.object({
    text: Joi.string().min(1).max(1000).required(),
  });

  return schema.validate(data);
};

module.exports = { validateCreateComment };
