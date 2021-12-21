const axios = require('axios');

const problemTypes = [
  "array",
  "string",
  "dynamic-programming",
  "hash-table",
  "binary-tree",
  "tree",
  "binary-search-tree",
  "recursion",
  "backtracking",
  "graph",
  "linked-list",
  "trie"
]

const dailyProblem = async () => {
  const randomProblem = problemTypes[Math.floor(Math.random() * problemTypes.length)];
  const difficulty = "Easy";
  try {
    const response = await axios({
      url: 'https://leetcode.com/graphql',
      method: 'post',
      data: {
        query: `query getTopicTag($slug: String!) {topicTag(slug: $slug){name translatedName questions{status title difficulty titleSlug acRate}} }`,
        variables: { "slug": randomProblem }
      }
    })
    const { data } = response.data;
    const questionArray = data.topicTag.questions || [];
    const filteredQuestions = questionArray.filter(question => question.difficulty === difficulty);
    const randomQuestion = Math.floor(Math.random() * filteredQuestions.length);
    return `https://leetcode.com/problems/${filteredQuestions[randomQuestion].titleSlug}`;
  } catch (err) {
    console.log(err)
  }
}

module.exports = dailyProblem;