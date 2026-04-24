'use strict';

import db from '../models/index.js';
import { Op } from 'sequelize';

const { User, Profile, Interest } = db;

export const getMatches = async (req, res) => {
  try {
    const matches = await Interest.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { from_user: req.user.id },
          { to_user: req.user.id },
        ],
      },
      include: [
        { model: Profile, as: 'toProfile' },
        { model: Profile, as: 'fromProfile' },
      ],
    });

    // Counts
    const [likesSentCount, likesReceivedCount, matchesCount] = await Promise.all([
      Interest.count({ where: { from_user: req.user.id } }),
      Interest.count({ where: { to_user: req.user.id } }),
      Interest.count({
        where: {
          is_mutual: true,
          [Op.or]: [
            { from_user: req.user.id },
            { to_user: req.user.id },
          ],
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: matches,
      counts: {
        likes_sent: likesSentCount,
        likes_received: likesReceivedCount,
        matches: matchesCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};