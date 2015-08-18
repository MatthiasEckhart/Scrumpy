Meteor.roles.deny({
    insert: denyPermission,
    update: denyPermission,
    remove: denyPermission
});

Meteor.methods({
    createRole: function (productId, administrator) {
        if (Meteor.isServer) {
            Roles.addUsersToRoles(Users.findOne({username: administrator}), [productId], 'administrator');
        }
    },
    createRoleAdvanced: function (productId, productOwner) {
        if (Meteor.isServer) {
            if (productOwner.length !== 0) {
                Roles.addUsersToRoles(Users.findOne({username: productOwner}), [productId], 'productOwner');
            }
        }
    },
    modifyUserInvitation: function (productId, user, status) {
        if (Meteor.isServer) {
            var role = null,
                pm = PrivateMessages.findOne({'productId': productId}),
                devTeamInv = [],
                scrumMasterInv = [];
            _.each(pm.messages, function (m) {
                if (_.has(m, "invitations")) {
                    if (_.has(m.invitations, "developmentTeam")) {
                        Invitations.find({_id: {$in: m.invitations.developmentTeam}}).forEach(function (inv) {
                            devTeamInv.push(inv);
                        });
                    }
                    if (_.has(m.invitations, "scrumMaster")) {
                        Invitations.find({_id: m.invitations.scrumMaster}).forEach(function (inv) {
                            scrumMasterInv.push(inv);
                        });
                    }
                }
            });
            if (devTeamInv.length > 0) {
                _.each(devTeamInv, function (u) {
                    if (u.username === user.username && u.status === 0) {
                        u.status = status;
                        role = 'developmentTeam';
                        Invitations.update({_id: u._id}, {$set: {status: status}});
                    }
                });
            }
            if (scrumMasterInv.length > 0) {
                _.each(scrumMasterInv, function (u) {
                    if (u.username === user.username && u.status === 0) {
                        u.status = status;
                        role = 'scrumMaster';
                        Invitations.update({_id: u._id}, {$set: {status: status}});
                    }
                });
            }
            if (status === 1) {
                Roles.addUsersToRoles(user, [productId], role);
            }
        }
    },
    updateRoleInvitation: function (message, productId, participants, participantsToRemove) {
        if (Meteor.isServer) {
            var participantsIds = [],
                pm;
            Users.find({username: {$in: participants}}).forEach(function (user) {
                participantsIds.push(user._id);
            });

            participantsIds = _.union(participantsIds, PrivateMessages.findOne({productId: productId}).participants);
            Users.find({username: {$in: participantsToRemove}}).forEach(function (user) {
                if (_.contains(participantsIds, user._id)) {
                    participantsIds = _.without(participantsIds, user._id);
                }
                if (Roles.userIsInRole(user, [productId], 'developmentTeam')) {
                    Roles.removeUsersFromRoles(user, [productId], 'developmentTeam');
                } else if (Roles.userIsInRole(user, [productId], 'scrumMaster')) {
                    Roles.removeUsersFromRoles(user, [productId], 'scrumMaster');
                }
            });
            if (participantsToRemove.length > 0) {
                PrivateMessages.update({productId: productId}, {
                    $set: {participants: participantsIds}
                });
            } else {
                PrivateMessages.update({productId: productId}, {
                    $push: {messages: message},
                    $set: {participants: participantsIds}
                });
            }
            pm = PrivateMessages.findOne({productId: productId});
            Users.update({username: {$in: participants}}, {$push: {privateMessages: pm._id}}, {multi: true});
            Users.update({username: {$in: participantsToRemove}}, {$pull: {privateMessages: pm._id}}, {multi: true});
            createPrivateMessageNotification(pm.slug, pm.userId);
        }
    }
});