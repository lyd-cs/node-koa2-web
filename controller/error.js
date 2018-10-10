/**
 * error
 */

exports.notFound = async(ctx, next) => {
  await next();
};
exports.serverError = async(ctx, next) => {
  await next();
};
