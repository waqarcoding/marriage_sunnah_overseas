import db from '../models/index.js';
const { User, Profile, Guardian, Match, Interest, Message, Dislike } = db;
import { Op } from 'sequelize';

export const getPendingProfiles = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const profiles = await Profile.findAll({
      where: { verified: false },
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role'] }],
    });

    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { profileId } = req.params;
    const profile = await Profile.findByPk(profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.verified = true;
    await profile.save();

    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const suspendUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.is_suspended = true;
    await user.save();

    const profile = await user.getProfile();
    if (profile) {
      profile.verified = false;
      await profile.save();
    }

    res.json({ success: true, message: 'User suspended' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const unsuspendUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.is_suspended = false;
    await user.save();

    res.json({ success: true, message: 'User unsuspended' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = await user.getProfile();
    if (profile) await profile.destroy();

    await user.destroy();

    res.json({ success: true, message: 'User deleted permanently' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      include: [
        { model: Profile, as: 'profile' },
        { model: Guardian, as: 'guardians' },
        { model: Match, as: 'matchesSent' },
        { model: Match, as: 'matchesReceived' },
        { model: Interest, as: 'interestsSent' },
        { model: Interest, as: 'interestsReceived' },
        { model: Message, as: 'sentMessages' },
        { model: Message, as: 'receivedMessages' },
      ],
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getVerifiedProfiles = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const profiles = await Profile.findAll({
      where: { verified: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role'] }],
    });

    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { query } = req.query;

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${query}%` } },
          { mobile: { [Op.like]: `%${query}%` } },
        ],
      },
      include: [{ model: Profile, as: 'profile' }],
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPendingCount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Profile, as: 'profile' }]
    });

    if (!user || !user.profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const count = await Interest.count({
      where: {
        to_user: user.profile.individual_id,
        status: 'pending'
      }
    });

    res.json({ pendingCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export default {
  getPendingProfiles,
  verifyProfile,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getUserDetails,
  getVerifiedProfiles,
  searchUsers,
  getPendingCount,
};