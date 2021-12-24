const axios = require('axios');

const dailyProblem = async (difficulty, problemType) => {
  const difficulties = ['Easy', 'Medium', 'Hard']
  if (difficulty === 'Random') {
    difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
  }
  try {
    const response = await axios({
      url: 'https://leetcode.com/graphql',
      method: 'post',
      data: {
        query: `query getTopicTag($slug: String!) {topicTag(slug: $slug){name translatedName questions{status title difficulty titleSlug acRate}} }`,
        variables: { "slug": problemType }
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