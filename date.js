// Gets date
exports.getDate = function() {
  let today = new Date();

  let options = {
    day: "numeric",
    year: "numeric",
    month: "long"
  };
  return today.toLocaleDateString("en-US", options);
};

// Gets day
exports.getDay = function() {
  let options = {
    weekday: "long"
  };
  let today = new Date();
  return today.toLocaleDateString("en-US", options);

};
