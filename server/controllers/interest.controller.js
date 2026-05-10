// @ts-nocheck
// controllers/interest.controller.js
import { deductCredits, hasEnoughCredits } from '../utils/credits.js';

import db from '../models/index.js';
const { User, Profile, Interest, Match, Guardian, Dislike } = db;
import { Op } from 'sequelize';
import {
    notifyInterestReceived,
    notifyInterestAccepted,
    notifyInterestDeclined,
    notifyInterestCancelled,
    notifyInterestCount,
    notifyNewMatch,
    notifyGuardianPendingCount,
    notifyGuardianApproved,
    notifyGuardianRejected,
    createNotification
} from '../config/socket.js';


// ── Helpers ───────────────────────────────────────────────────────────────────
const pushInterestCount = async (toUserId) => {
    const count = await Interest.count({ where: { to_user: toUserId, status: 'pending' } });
    notifyInterestCount(toUserId, count);
};

const pushGuardianPendingCount = async (guardianUserId) => {
    const rows = await Guardian.findAll({ where: { guardian_id: guardianUserId }, attributes: ['individual_id'] });
    const wardIds = rows.map(r => r.individual_id);
    if (!wardIds.length) return;
    const count = await Interest.count({
        where: { to_user: { [Op.in]: wardIds }, status: 'pending', to_guardian_status: 'pending' },
    });
    notifyGuardianPendingCount(guardianUserId, count);
};

// Returns { rowId: Guardian.id, userId: guardian_user_id } or null
const getGuardianOf = async (userId) => {
    const row = await Guardian.findOne({
        where: { individual_id: userId },
        attributes: ['id', 'guardian_id'],
    });
    return {
        id: row.id,              // Changed from: rowId: row.id
        userId: row.guardian_id
    };
};

// ── Fetch avatar_url for a user (always from users.avatar_url) ────────────────
const getAvatarUrl = async (userId) => {
    const u = await User.findByPk(userId, { attributes: ['avatar_url'] });
    return u?.avatar_url || null;
};

const profileInclude = [
    {
        model: Profile,
        as: 'fromProfile',
        include: [
            { model: Guardian, as: 'asGuardian' },
            { model: User, as: 'user' },
        ],
    },
    {
        model: Profile,
        as: 'toProfile',
        include: [
            { model: Guardian, as: 'asGuardian' },
            { model: User, as: 'user' },
        ],
    },
];

const checkFullApproval = (interest) => {
    const fromOk = !interest.from_guardian || interest.from_guardian_status === 'accepted';
    const toOk = !interest.to_guardian || interest.to_guardian_status === 'accepted';
    return fromOk && toOk;
};

// ✅ CORRECT: sendInterest - NO duplicate email calls
export const sendInterest = async (req, res) => {
    try {
        const fromUserId = req.user.id;
        const { interestId, isSuperLike = false } = req.body;
        // ✅ ADD THIS LOGGING FIRST
        console.log('=== DEBUG sendInterest ===');
        console.log('req.user:', req.user);
        console.log('req.user.id:', req.user?.id);
        console.log('req.body:', req.body);
        console.log(`📨 sendInterest called: fromUserId=${fromUserId}, toUserId=${interestId}, isSuperLike=${isSuperLike}`);

        if (!interestId)
            return res.json({ success: false, message: 'interestId is required' });

        const toUserId = Number(interestId);

        if (fromUserId === toUserId)
            return res.json({ success: false, message: 'Cannot send interest to yourself' });

        // ✅ CRITICAL FIX: Check if both users exist in the database
        const [fromUser, toUser] = await Promise.all([
            User.findByPk(fromUserId),
            User.findByPk(toUserId)
        ]);

        if (!fromUser) {
            console.error(`❌ From user not found: ${fromUserId}`);
            return res.status(401).json({
                success: false,
                message: 'Your account was not found. Please log in again.',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!toUser) {
            console.error(`❌ To user not found: ${toUserId}`);
            return res.status(404).json({
                success: false,
                message: 'The user you are trying to send interest to does not exist.',
                code: 'RECIPIENT_NOT_FOUND'
            });
        }

        const existing = await Interest.findOne({
            where: { from_user: fromUserId, to_user: toUserId, status: { [Op.in]: ['pending', 'accepted'] } },
        });
        if (existing)
            return res.json({ success: false, message: 'Interest already sent' });

        const creditCost = isSuperLike ? 10 : 1;
        const hasCredits = await hasEnoughCredits(fromUserId, creditCost);
        if (!hasCredits) {
            return res.json({
                success: false,
                code: 'INSUFFICIENT_CREDITS',
                message: `You need ${creditCost} credit${creditCost > 1 ? 's' : ''} to send ${isSuperLike ? 'a super like' : 'an interest'}`,
                required: creditCost,
            });
        }

        const reverseInterest = await Interest.findOne({
            where: { from_user: toUserId, to_user: fromUserId, status: 'pending' },
        });

        if (reverseInterest) {
            console.log(`💑 Mutual match detected!`);

            const [fromGuardian, toGuardian] = await Promise.all([
                getGuardianOf(fromUserId),
                getGuardianOf(toUserId),
            ]);

            await reverseInterest.update({
                status: 'accepted',
                is_mutual: true,
                both_users_approved: true
            });

            const mutualInterest = await Interest.create({
                from_user: fromUserId,
                to_user: toUserId,
                status: 'accepted',
                is_super_like: isSuperLike,
                is_mutual: true,
                both_users_approved: true,
                both_guardians_approved: false,
                from_guardian: fromGuardian?.id || null,
                from_guardian_status: 'pending',
                to_guardian: toGuardian?.rowId || null,
                to_guardian_status: 'pending',
            });

            const deductResult = await deductCredits(
                fromUserId,
                creditCost,
                `${isSuperLike ? 'Super like' : 'Interest'} (mutual match)`
            );
            if (!deductResult.success) {
                console.error('⚠️ Failed to deduct credits after mutual match:', deductResult.error);
            }

            const [senderProfile, toProfile] = await Promise.all([
                Profile.findOne({ where: { individual_id: fromUserId } }),
                Profile.findOne({ where: { individual_id: toUserId } }),
            ]);

            // ✅ notifyInterestReceived already sends email - no need to call sendInterestReceivedEmail again
            notifyInterestReceived(toUserId, {
                interest_id: mutualInterest.id,
                sender_id: fromUserId,
                sender_name: senderProfile?.name || fromUser?.name || '',
                sender_avatar_url: fromUser?.avatar_url,
                is_mutual: true,
                toUser: toUser,
                senderUser: fromUser,
                senderProfile: senderProfile,
                toUserEmail: toUser?.email,
            });

            await pushInterestCount(toUserId);

            return res.status(200).json({
                success: true,
                is_mutual: true,
                message: 'Mutual interest — they already sent you an interest!',
                data: { ...mutualInterest.toJSON(), creditsRemaining: deductResult.newBalance },
            });
        }

        // ── No reverse interest — create new ──────────────────────────────────
        const [fromGuardian, toGuardian] = await Promise.all([
            getGuardianOf(fromUserId),
            getGuardianOf(toUserId),
        ]);

        const interest = await Interest.create({
            from_user: fromUserId,
            to_user: toUserId,
            status: 'pending',
            is_super_like: isSuperLike,
            is_mutual: false,
            both_users_approved: false,
            both_guardians_approved: false,
            from_guardian: fromGuardian?.id || null,
            from_guardian_status: 'pending',
            to_guardian: toGuardian?.rowId || null,
            to_guardian_status: 'pending',
        });

        const deductResult = await deductCredits(
            fromUserId,
            creditCost,
            isSuperLike ? 'Super like' : 'Send interest'
        );

        if (!deductResult.success) {
            await interest.destroy();
            return res.json({
                success: false,
                code: deductResult.code,
                message: deductResult.error,
                currentBalance: deductResult.currentBalance,
            });
        }

        const [senderProfile, toProfile] = await Promise.all([
            Profile.findOne({ where: { individual_id: fromUserId } }),
            Profile.findOne({ where: { individual_id: toUserId } }),
        ]);

        // ✅ notifyInterestReceived already sends email - no need to call sendInterestReceivedEmail again
        notifyInterestReceived(toUserId, {
            interest_id: interest.id,
            sender_id: fromUserId,
            sender_name: senderProfile?.name || fromUser?.name || '',
            sender_avatar_url: fromUser?.avatar_url,
            is_mutual: false,
            toUser: toUser,
            senderUser: fromUser,
            senderProfile: senderProfile,
            toUserEmail: toUser?.email,
        });

        await pushInterestCount(toUserId);

        return res.status(201).json({
            success: true,
            is_mutual: false,
            message: `${isSuperLike ? 'Super like' : 'Interest'} sent successfully`,
            data: {
                ...interest.toJSON(),
                to_guardian_user_id: toGuardian?.userId || null,
                creditsRemaining: deductResult.newBalance,
                creditsDeducted: creditCost,
            },
        });

    } catch (err) {
        console.error('❌ sendInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};
// ✅ CORRECT: acceptInterest - Remove duplicate email calls for interest accepted and match
export const acceptInterest = async (req, res) => {
    try {
        const toUserId = req.user.id;
        const { interestId } = req.body;

        const interest = await Interest.findOne({
            where: { id: Number(interestId), to_user: toUserId, status: 'pending' },
            include: profileInclude,
        });
        if (!interest)
            return res.json({ success: false, message: 'Interest not found' });

        const guardiansOk = checkFullApproval(interest);

        await interest.update({
            both_users_approved: true,
            status: guardiansOk ? 'accepted' : 'pending',
            is_mutual: true,
            both_guardians_approved: guardiansOk,
        });

        const [acceptorAvatarUrl, senderUser, acceptedByUser, acceptedByProfile, senderProfile] = await Promise.all([
            getAvatarUrl(toUserId),
            User.findByPk(interest.from_user, { attributes: ['id', 'name', 'email', 'avatar_url'] }),
            User.findByPk(toUserId, { attributes: ['id', 'name', 'email', 'avatar_url'] }),
            Profile.findOne({ where: { individual_id: toUserId } }),
            Profile.findOne({ where: { individual_id: interest.from_user } }),
        ]);

        // ✅ notifyInterestAccepted already sends email - no duplicate call needed
        notifyInterestAccepted(interest.from_user, {
            interest_id: interest.id,
            accepted_by_id: toUserId,
            accepted_by_name: interest.toProfile?.name || acceptedByUser?.name || '',
            accepted_by_avatar_url: acceptorAvatarUrl,
            senderUser: senderUser,
            acceptedByUser: acceptedByUser,
            acceptedByProfile: acceptedByProfile,
            fromUserEmail: senderUser?.email,
        });

        if (guardiansOk) {
            const [user1AvatarUrl, user2AvatarUrl, user1Profile, user2Profile] = await Promise.all([
                getAvatarUrl(interest.from_user),
                getAvatarUrl(toUserId),
                Profile.findOne({ where: { individual_id: interest.from_user } }),
                Profile.findOne({ where: { individual_id: toUserId } }),
            ]);

            const match = await Match.create({
                interest_id: interest.id,
                user1: interest.from_user,
                user2: toUserId,
            });

            // ✅ notifyNewMatch already sends email - no duplicate call needed
            notifyNewMatch(interest.from_user, toUserId, {
                match_id: match.id,
                user1_name: interest.fromProfile?.name || senderUser?.name,
                user2_name: interest.toProfile?.name || acceptedByUser?.name,
                user1_avatar_url: user1AvatarUrl,
                user2_avatar_url: user2AvatarUrl,
                user1Model: senderUser,
                user2Model: acceptedByUser,
                user1Profile: senderProfile,
                user2Profile: acceptedByProfile,
            });

            return res.json({ success: true, message: 'Interest accepted — match created!', data: match });
        }

        // ✅ NOW notify BOTH guardians
        const [fromGuardian, toGuardian] = await Promise.all([
            getGuardianOf(interest.from_user),
            getGuardianOf(toUserId),
        ]);

        if (fromGuardian) {
            await pushGuardianPendingCount(fromGuardian.userId);

            const fromGuardianUser = await User.findByPk(fromGuardian.userId, {
                attributes: ['id', 'name', 'email', 'avatar_url']
            });

            if (fromGuardianUser) {
                await createNotification({
                    userId: fromGuardian.userId,
                    type: 'guardian_new_interest',
                    title: 'New Interest for Your Ward 🕌',
                    message: `${senderProfile?.name || senderUser?.name} and ${acceptedByProfile?.name || acceptedByUser?.name} mutually accepted - awaiting your approval`,
                    data: {
                        interest_id: interest.id,
                        ward_id: interest.from_user,
                        ward_name: senderProfile?.name || senderUser?.name,
                        sender_id: toUserId,
                        sender_name: acceptedByProfile?.name || acceptedByUser?.name,
                        sender_avatar_url: acceptedByUser?.avatar_url,
                    },
                    sender_image: acceptedByUser?.avatar_url,
                });

                // ✅ Send email using proper template method
                const { sendGuardianMutualInterestEmail } = await import('../mail/service.js');
                await sendGuardianMutualInterestEmail(
                    fromGuardianUser,
                    senderProfile?.name || senderUser?.name,
                    acceptedByProfile?.name || acceptedByUser?.name,
                    acceptedByProfile
                );
            }
        }

        if (toGuardian) {
            await pushGuardianPendingCount(toGuardian.userId);

            const toGuardianUser = await User.findByPk(toGuardian.userId, {
                attributes: ['id', 'name', 'email', 'avatar_url']
            });

            if (toGuardianUser) {
                await createNotification({
                    userId: toGuardian.userId,
                    type: 'guardian_new_interest',
                    title: 'New Interest for Your Ward 🕌',
                    message: `${senderProfile?.name || senderUser?.name} and ${acceptedByProfile?.name || acceptedByUser?.name} mutually accepted - awaiting your approval`,
                    data: {
                        interest_id: interest.id,
                        ward_id: toUserId,
                        ward_name: acceptedByProfile?.name || acceptedByUser?.name,
                        sender_id: interest.from_user,
                        sender_name: senderProfile?.name || senderUser?.name,
                        sender_avatar_url: senderUser?.avatar_url,
                    },
                    sender_image: senderUser?.avatar_url,
                });

                // ✅ Send email using proper template method
                const { sendGuardianMutualInterestEmail } = await import('../mail/service.js');
                await sendGuardianMutualInterestEmail(
                    toGuardianUser,
                    acceptedByProfile?.name || acceptedByUser?.name,
                    senderProfile?.name || senderUser?.name,
                    senderProfile
                );
            }
        }

        return res.json({ success: true, message: 'You accepted — waiting for guardian approval', data: interest });
    } catch (err) {
        console.error('acceptInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};
// ── GET /interest/get-interests ───────────────────────────────────────────────
export const getInterests = async (req, res) => {
    try {
        const userId = req.user.id;

        const [sent, received, matches, rejected] = await Promise.all([
            Interest.findAll({
                where: { from_user: userId, status: 'pending' },
                include: [{ model: Profile, as: 'toProfile', include: [{ model: User, as: 'user' }] }],
                order: [['created_at', 'DESC']],
            }),
            Interest.findAll({
                where: { to_user: userId, status: 'pending' },
                include: [{ model: Profile, as: 'fromProfile', include: [{ model: User, as: 'user' }] }],
                order: [['created_at', 'DESC']],
            }),
            Interest.findAll({
                where: { status: 'accepted', [Op.or]: [{ from_user: userId }, { to_user: userId }] },
                include: profileInclude,
                order: [['created_at', 'DESC']],
            }),
            Interest.findAll({
                where: { from_user: userId, status: 'declined' },
                include: profileInclude,
                order: [['created_at', 'DESC']],
            }),
        ]);

        const filterOwn = (list, profileKey) =>
            list.filter(i => i[profileKey]?.individual_id !== userId);

        return res.json({
            success: true,
            data: {
                sent: filterOwn(sent, 'toProfile'),
                received: filterOwn(received, 'fromProfile'),
                matches,
                rejected,
            },
            counts: {
                sent: sent.length,
                received: received.length,
                matches: matches.length,
            },
        });
    } catch (err) {
        console.error('getInterests error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ── POST /interest/cancel-interest ───────────────────────────────────────────
export const cancelInterest = async (req, res) => {
    try {
        const fromUserId = req.user.id;
        const { interestId } = req.body;

        const interest = await Interest.findOne({ where: { id: Number(interestId), from_user: fromUserId } });
        if (!interest)
            return res.json({ success: false, message: 'Interest not found' });

        await interest.update({ status: 'declined' });

        const cancellerAvatarUrl = await getAvatarUrl(fromUserId);

        notifyInterestCancelled(interest.to_user, {
            interest_id: interest.id,
            cancelled_by: fromUserId,
            cancelled_by_avatar_url: cancellerAvatarUrl,
        });

        await pushInterestCount(interest.to_user);
        const toGuardian = await getGuardianOf(interest.to_user);
        if (toGuardian) await pushGuardianPendingCount(toGuardian.userId);

        return res.json({ success: true, message: 'Interest cancelled' });
    } catch (err) {
        console.error('cancelInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};



// ── POST /interest/decline-interest ──────────────────────────────────────────
export const declineInterest = async (req, res) => {
    try {
        const toUserId = req.user.id;
        const { interestId } = req.body;

        const interest = await Interest.findOne({
            where: { id: Number(interestId), to_user: toUserId, status: 'pending' },
            include: [{ model: Profile, as: 'toProfile', attributes: ['name'] }],
        });
        if (!interest)
            return res.json({ success: false, message: 'Interest not found' });

        await interest.update({ status: 'declined' });

        const declinerAvatarUrl = await getAvatarUrl(toUserId);

        notifyInterestDeclined(interest.from_user, {
            interest_id: interest.id,
            declined_by_id: toUserId,
            declined_by_name: interest.toProfile?.name || '',
            declined_by_avatar_url: declinerAvatarUrl,
        });

        await pushInterestCount(toUserId);
        const toGuardian = await getGuardianOf(interest.to_user);
        if (toGuardian) await pushGuardianPendingCount(toGuardian.userId);

        return res.json({ success: true, message: 'Interest declined' });
    } catch (err) {
        console.error('declineInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ── POST /guardian/guardian-approve-interest ──────────────────────────────────
export const guardianApproveInterest = async (req, res) => {
    try {
        const guardianUserId = req.user.id;
        const { interestId } = req.body;

        if (!interestId)
            return res.json({ success: false, message: 'interestId is required' });

        const interest = await Interest.findByPk(Number(interestId), { include: profileInclude });
        if (!interest)
            return res.json({ success: false, message: 'Interest not found' });

        const [fromGuardianRow, toGuardianRow] = await Promise.all([
            Guardian.findOne({ where: { individual_id: interest.from_user, guardian_id: guardianUserId } }),
            Guardian.findOne({ where: { individual_id: interest.to_user, guardian_id: guardianUserId } }),
        ]);

        const isFromGuardian = !!fromGuardianRow;
        const isToGuardian = !!toGuardianRow;
        const isBothWards = isFromGuardian && isToGuardian;

        if (!isFromGuardian && !isToGuardian)
            return res.status(403).json({ success: false, message: 'You are not a guardian for this interest' });

        if (isBothWards) {
            await interest.update({ from_guardian_status: 'accepted', to_guardian_status: 'accepted' });
        } else {
            await interest.update(
                isFromGuardian
                    ? { from_guardian_status: 'accepted' }
                    : { to_guardian_status: 'accepted' }
            );
        }

        await interest.reload();

        const bothGuardiansOk = checkFullApproval(interest);

        // ✅ Fetch guardian profile and ward user models
        const [guardianAvatarUrl, guardianProfile] = await Promise.all([
            getAvatarUrl(guardianUserId),
            Profile.findOne({ where: { individual_id: guardianUserId }, attributes: ['name'] }),
        ]);
        const guardianName = guardianProfile?.name || '';

        if (isBothWards) {
            // ✅ Fetch both wards' User models and other person's names
            const [fromWardUser, toWardUser, fromProfile, toProfile] = await Promise.all([
                User.findByPk(interest.from_user, { attributes: ['id', 'name', 'email', 'avatar_url'] }),
                User.findByPk(interest.to_user, { attributes: ['id', 'name', 'email', 'avatar_url'] }),
                Profile.findOne({ where: { individual_id: interest.from_user } }),
                Profile.findOne({ where: { individual_id: interest.to_user } }),
            ]);

            // Notify both wards
            notifyGuardianApproved(interest.from_user, {
                interest_id: interest.id,
                guardian_id: guardianUserId,
                ward_name: fromProfile?.name || fromWardUser?.name || '',
                from_user_id: interest.from_user,
                to_user_id: interest.to_user,
                other_guardian_id: null,
                guardian_name: guardianName,
                guardian_avatar_url: guardianAvatarUrl,
                // ✅ Pass full models for email
                wardUser: fromWardUser,
                other_person_name: toProfile?.name || toWardUser?.name || '',
            });
            notifyGuardianApproved(interest.to_user, {
                interest_id: interest.id,
                guardian_id: guardianUserId,
                ward_name: toProfile?.name || toWardUser?.name || '',
                from_user_id: interest.from_user,
                to_user_id: interest.to_user,
                other_guardian_id: null,
                guardian_name: guardianName,
                guardian_avatar_url: guardianAvatarUrl,
                // ✅ Pass full models for email
                wardUser: toWardUser,
                other_person_name: fromProfile?.name || fromWardUser?.name || '',
            });
        } else {
            const wardUserId = isFromGuardian ? interest.from_user : interest.to_user;
            const wardProfile = isFromGuardian ? interest.fromProfile : interest.toProfile;
            const otherUserId = isFromGuardian ? interest.to_user : interest.from_user;
            const otherProfile = isFromGuardian ? interest.toProfile : interest.fromProfile;
            const otherGuardianId = isFromGuardian
                ? (toGuardianRow ? toGuardianRow.guardian_id : null)
                : (fromGuardianRow ? fromGuardianRow.guardian_id : null);

            // ✅ Fetch ward User model and other person's details
            const [wardUser, otherUser] = await Promise.all([
                User.findByPk(wardUserId, { attributes: ['id', 'name', 'email', 'avatar_url'] }),
                User.findByPk(otherUserId, { attributes: ['id', 'name', 'email', 'avatar_url'] }),
            ]);

            notifyGuardianApproved(wardUserId, {
                interest_id: interest.id,
                guardian_id: guardianUserId,
                ward_name: wardProfile?.name || wardUser?.name || '',
                from_user_id: interest.from_user,
                to_user_id: interest.to_user,
                other_guardian_id: otherGuardianId,
                guardian_name: guardianName,
                guardian_avatar_url: guardianAvatarUrl,
                // ✅ Pass full models for email
                wardUser: wardUser,
                other_person_name: otherProfile?.name || otherUser?.name || '',
            });
        }

        // ✅ Check if both guardians approved and create match if needed
        if (bothGuardiansOk) {
            await interest.update({ both_guardians_approved: true });

            if (interest.both_users_approved) {
                await interest.update({ status: 'accepted', is_mutual: true });

                // ✅ Fetch both users' full models for match notification
                const [user1AvatarUrl, user2AvatarUrl, user1, user2, user1Profile, user2Profile] = await Promise.all([
                    getAvatarUrl(interest.from_user),
                    getAvatarUrl(interest.to_user),
                    User.findByPk(interest.from_user, { attributes: ['id', 'name', 'email', 'avatar_url'] }),
                    User.findByPk(interest.to_user, { attributes: ['id', 'name', 'email', 'avatar_url'] }),
                    Profile.findOne({ where: { individual_id: interest.from_user } }),
                    Profile.findOne({ where: { individual_id: interest.to_user } }),
                ]);

                const match = await Match.create({
                    interest_id: interest.id,
                    user1: interest.from_user,
                    user2: interest.to_user,
                });

                notifyNewMatch(interest.from_user, interest.to_user, {
                    match_id: match.id,
                    user1_name: interest.fromProfile?.name || user1?.name,
                    user2_name: interest.toProfile?.name || user2?.name,
                    user1_avatar_url: user1AvatarUrl,
                    user2_avatar_url: user2AvatarUrl,
                    // ✅ Pass full models for match email
                    user1Model: user1,
                    user2Model: user2,
                    user1Profile: user1Profile,
                    user2Profile: user2Profile,
                });
            }
        }

        await pushGuardianPendingCount(guardianUserId);

        if (!isBothWards) {
            const otherGuardianUserId = isFromGuardian
                ? (toGuardianRow ? toGuardianRow.guardian_id : null)
                : (fromGuardianRow ? fromGuardianRow.guardian_id : null);
            if (otherGuardianUserId) await pushGuardianPendingCount(otherGuardianUserId);
        }

        return res.json({
            success: true,
            message: isBothWards
                ? 'You approved this interest for both your wards!'
                : bothGuardiansOk
                    ? 'Both guardians approved!'
                    : 'Guardian approval recorded',
            data: interest,
        });

    } catch (err) {
        console.error('guardianApproveInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ── POST /guardian/guardian-reject-interest ───────────────────────────────────
export const guardianRejectInterest = async (req, res) => {
    try {
        const guardianUserId = req.user.id;
        const { interestId } = req.body;

        const interest = await Interest.findByPk(Number(interestId), { include: profileInclude });
        if (!interest)
            return res.json({ success: false, message: 'Interest not found' });

        const [fromGuardianRow, toGuardianRow] = await Promise.all([
            Guardian.findOne({
                where: { guardian_id: guardianUserId, individual_id: interest.from_user },
            }),
            Guardian.findOne({
                where: { guardian_id: guardianUserId, individual_id: interest.to_user },
            }),
        ]);

        const isFromGuardian = !!fromGuardianRow;
        const isToGuardian = !!toGuardianRow;

        if (!isFromGuardian && !isToGuardian)
            return res.status(403).json({ success: false, message: 'You are not a guardian for this interest' });

        await interest.update({
            status: 'declined',
            both_guardians_approved: false,
            ...(isFromGuardian
                ? { from_guardian_status: 'declined' }
                : { to_guardian_status: 'declined' }),
        });

        const wardUserId = isFromGuardian ? interest.from_user : interest.to_user;
        const wardProfile = isFromGuardian ? interest.fromProfile : interest.toProfile;
        const otherUserId = isFromGuardian ? interest.to_user : interest.from_user;
        const otherProfile = isFromGuardian ? interest.toProfile : interest.fromProfile;

        // ✅ Fetch guardian's details and ward User model
        const [guardianAvatarUrl, guardianProfile, wardUser, otherUser] = await Promise.all([
            getAvatarUrl(guardianUserId),
            Profile.findOne({ where: { individual_id: guardianUserId }, attributes: ['name'] }),
            User.findByPk(wardUserId, { attributes: ['id', 'name', 'email', 'avatar_url'] }),
            User.findByPk(otherUserId, { attributes: ['id', 'name', 'email', 'avatar_url'] }),
        ]);

        const guardianName = guardianProfile?.name || '';
        const wardName = wardProfile?.name || wardUser?.name || '';
        const otherPersonName = otherProfile?.name || otherUser?.name || '';

        notifyGuardianRejected(wardUserId, {
            interest_id: interest.id,
            guardian_id: guardianUserId,
            guardian_name: guardianName,
            ward_name: wardName,
            from_user_id: interest.from_user,
            to_user_id: interest.to_user,
            other_guardian_id: isFromGuardian
                ? (toGuardianRow ? toGuardianRow.guardian_id : null)
                : (fromGuardianRow ? fromGuardianRow.guardian_id : null),
            guardian_avatar_url: guardianAvatarUrl,
            // ✅ Pass full models for email
            wardUser: wardUser,
            other_person_name: otherPersonName,
        });

        await pushGuardianPendingCount(guardianUserId);

        const otherGuardianUserId = isFromGuardian
            ? (toGuardianRow ? toGuardianRow.guardian_id : null)
            : (fromGuardianRow ? fromGuardianRow.guardian_id : null);
        if (otherGuardianUserId) await pushGuardianPendingCount(otherGuardianUserId);

        return res.json({ success: true, message: 'Interest rejected by guardian' });
    } catch (err) {
        console.error('guardianRejectInterest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ── GET /guardian/guardian-pending-interests ──────────────────────────────────
export const getGuardianPendingInterests = async (req, res) => {
    try {
        const guardianUserId = req.user.id;

        const guardianRows = await Guardian.findAll({
            where: { guardian_id: guardianUserId },
            attributes: ['individual_id'],
        });
        const wardIds = guardianRows.map(g => Number(g.individual_id));

        if (!wardIds.length)
            return res.json({ success: true, data: { pending: [], all: [], approved: [], rejected: [] } });

        const allInterests = await Interest.findAll({
            where: {
                [Op.or]: [
                    { from_user: { [Op.in]: wardIds } },
                    { to_user: { [Op.in]: wardIds }, status: { [Op.ne]: 'declined' } },
                ],
                both_users_approved: true, // ✅ Only get interests where BOTH users accepted
            },
            include: profileInclude,
            order: [['created_at', 'DESC']],
        });

        const pending = [];
        const approved = [];
        const rejected = [];

        allInterests.forEach(interest => {
            const fromUser = Number(interest.from_user);
            const toUser = Number(interest.to_user);
            const isFromWard = wardIds.includes(fromUser);
            const isToWard = wardIds.includes(toUser);

            let guardianStatus = null;
            if (isFromWard) guardianStatus = interest.from_guardian_status;
            else if (isToWard) guardianStatus = interest.to_guardian_status;

            if (guardianStatus === 'pending') pending.push(interest);
            else if (guardianStatus === 'accepted') approved.push(interest);
            else if (guardianStatus === 'declined') rejected.push(interest);
        });

        return res.json({
            success: true,
            data: { pending, all: allInterests, approved, rejected },
            counts: {
                pending: pending.length,
                all: allInterests.length,
                approved: approved.length,
                rejected: rejected.length,
            },
        });

    } catch (err) {
        console.error('getGuardianPendingInterests error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ── GET /interest/pending-count ───────────────────────────────────────────────
export const getPendingCount = async (req, res) => {
    try {
        const count = await Interest.count({
            where: { to_user: req.user.id, status: 'pending' },
        });
        return res.json({ success: true, data: { count } });
    } catch (err) {
        console.error('❌ getPendingCount error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ── POST /interest/dislike ────────────────────────────────────────────────────
export const sendDislike = async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.body.interestId;

        const existingDislike = await Dislike.findOne({
            where: { user_id: userId, target_user_id: targetUserId },
        });

        if (!existingDislike) {
            const reverseDislike = await Dislike.findOne({
                where: { user_id: targetUserId, target_user_id: userId },
            });

            await Dislike.create({
                user_id: userId,
                target_user_id: targetUserId,
                is_mutual: !!reverseDislike,
                is_seen: false,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        return res.json({ success: true, message: 'Dislike recorded' });
    } catch (err) {
        console.error('sendDislike error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// ── Aliases ───────────────────────────────────────────────────────────────────
export const getallInterests = getInterests;
export const pendingCount = getPendingCount;

export default {
    sendInterest,
    cancelInterest,
    acceptInterest,
    declineInterest,
    sendDislike,
    guardianApproveInterest,
    guardianRejectInterest,
    getGuardianPendingInterests,
    getInterests,
    getallInterests,
    getPendingCount,
    pendingCount,
};