import { getServerSession } from "next-auth";
import { Game, GameQuestionAnswer } from "../../../models/Game";
import Score from "../../../models/Score";
import User from "../../../models/User";
import sequelize from "../../../services/Sequelize";
const { Op } = require("sequelize");

export default async function scores (req, res) {
  const session = await getServerSession(req, res);

  if (!session) {
    res.send({
      error: "Error"
    })
    return;
  }
  
  try {
    // process answers

    const scores_ = await Score.findAll({
      attributes: [
        'gameId', 'userId',
        [sequelize.fn('sum', sequelize.col('score')), 'score']
      ],
      group: ['gameId', 'userId']
    });

    let scores = [];

    for(const {dataValues} of scores_) {
      const game = await Game.findByPk(dataValues.gameId);
      const user = await User.findByPk(dataValues.userId);

      scores.push({
        game: game.dataValues.name,
        user: user.dataValues.name,
        score: dataValues.score,
      })
    }

    scores.sort((a, b) => b.score - a.score)

    res.status(200).json({scores})

  } catch (error) {
    console.error(error);
    res.status(500);
  }
}
