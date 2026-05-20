const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        data: null,
        message: errors.map((e) => `${e.field}: ${e.message}`).join(", "),
      });
    }

    req.body = result.data;
    next();
  };
};

export default validateBody;
