module.exports = function getLimitOffset(req, defaultLimit = Number(process.env.DF_SEARCH_ITEMS_LIMIT) || 10) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : defaultLimit;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    return { limit, offset };
  } catch (err) {
    console.log(err)
  }
};