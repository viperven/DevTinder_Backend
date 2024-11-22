// errorValidations.js
function handleDuplicateKeyError(error, next) {
  if (error.code === 11000) {
    // Duplicate key error code
    // Extract the field that caused the duplicate key error

    const field = Object.keys(error.keyValue)[0];
    let message = "";

    if (field === "emailId") {
      message = "Email is already in use. Please choose a different one.";
    } else {
      message = "Duplicate field value entered.";
    }

    const customError = new Error(message);
    customError.statusCode = 400; // Bad Request
    customError.field = field;
    console.log(customError);

    // Pass the custom error message
    next(customError);
  } else {
    next(error); // Pass other errors to the next handler
  }
}

module.exports = handleDuplicateKeyError;
