const titleCaseHelper = (str) => {
  str.toLowerCase();
  return str.slice(0, 1).toUpperCase() + str.slice(1)
}

module.exports = titleCaseHelper