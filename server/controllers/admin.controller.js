const db = require('../models');
const { User, Profile, Guardian, Match, Interest, Message, Dislike } = db;
const { Op } = require('sequelize');

module.exports = {
  /**
   * Get all pending profiles (unverified)
   */
  getPendingProfiles: async (req, res) => {
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
  },

  /**
   * Verify a profile
   */
  verifyProfile: async (req, res) => {
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
  },

  /**
   * Suspend a user (soft delete)
   */
  suspendUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

      const { userId } = req.params;
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      user.is_suspended = true;
      await user.save();

      // Optional: Suspend profile as well
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
  },

  /**
   * Unsuspend a user
   */
  unsuspendUser: async (req, res) => {
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
  },

  /**
   * Delete user (hard delete)
   */
  deleteUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

      const { userId } = req.params;
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Delete related profiles, guardians, interests, messages (optional cascade)
      const profile = await user.getProfile();
      if (profile) await profile.destroy();

      await user.destroy();

      res.json({ success: true, message: 'User deleted permanently' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  /**
   * Get full user info including profile, guardians, matches, messages, interests
   */
  getUserDetails: async (req, res) => {
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
  },

  /**
   * List all verified profiles
   */
  getVerifiedProfiles: async (req, res) => {
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
  },

  /**
   * Search users by email, mobile, or name
   */
  searchUsers: async (req, res) => {
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
  },

  getPendingCount: async (req, res) => {
    try {

      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Profile,
          as: 'profile'   // 👈 IMPORTANT
        }]
      });

      if (!user || !user.profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const count = await Interest.count({
        where: {
          to_user: user.profile.individual_id, // 👈 now works
          status: 'pending'
        }
      });

      res.json({ pendingCount: count });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },
};