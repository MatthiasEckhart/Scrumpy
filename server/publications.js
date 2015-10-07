"use strict";

Meteor.publish('products', function (options, productIds) {
    if (!productIds) {
        this.ready();
    }
    return Products.find({_id: {$in: productIds}}, options);
});

Meteor.publish('singleProduct', function (slug) {
    var product = Products.find({slug: slug});
    if (product.count() > 0) {
        return product;
    }
    this.ready();
});

Meteor.publish('projectsForNotification', function () {
    var productIds = _.union(Roles.getRolesForUser(this.userId, "administrator"), Roles.getRolesForUser(this.userId, "developmentTeam"), Roles.getRolesForUser(this.userId, "productOwner"), Roles.getRolesForUser(this.userId, "scrumMaster"));
    if (productIds.length > 0) {
        return Products.find({_id: {$in: productIds}}, {fields: {slug: 1}});
    }
    this.ready();
});

Meteor.publish('statisticsForProfilePage', function (username) {
    var user = Users.findOne({username: username}),
        productIds;
    if (user) {
        productIds = _.union(Roles.getRolesForUser(user._id, "administrator"), Roles.getRolesForUser(user._id, "developmentTeam"), Roles.getRolesForUser(user._id, "productOwner"), Roles.getRolesForUser(user._id, "scrumMaster"));
        if (productIds.length > 0) {
            return [Products.find({_id: {$in: productIds}}, {
                fields: {
                    advancedMode: 1,
                    author: 1
                }
            }), Sprints.find({author: user.username}, {fields: {author: 1}}), UserStories.find({author: user.username}, {fields: {author: 1}}), Stickies.find({author: user.username}, {fields: {author: 1}})];
        }
        this.ready();
    } else {
        this.ready();
    }
});

Meteor.publish('activityStreamElements', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return ActivityStreamElements.find({productId: product._id});
    }
    this.ready();
});

Meteor.publish('sprints', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Sprints.find({productId: product._id});
    }
    this.ready();
});

Meteor.publish('usernamesRoles', function () {
    return Users.find({}, {
        fields: {'username': 1, 'roles': 1}
    });
});

Meteor.publish(null, function () {
    var productIds = _.union(Roles.getRolesForUser(this.userId, "administrator"), Roles.getRolesForUser(this.userId, "developmentTeam"), Roles.getRolesForUser(this.userId, "productOwner"), Roles.getRolesForUser(this.userId, "scrumMaster"));
    if (productIds.length > 0) {
        return Meteor.roles.find({name: {$in: productIds}});
    }
    this.ready();
});

Meteor.publish('productInvitations', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Invitations.find({productId: product._id, status: {$ne: 2}});
    }
    this.ready();
});

Meteor.publish('invitationsPM', function (slug) {
    var pm = PrivateMessages.findOne({slug: slug}),
        invIds = [];
    if (pm) {
        _.each(pm.messages, function (m) {
            if (_.has(m, 'invitations')) {
                if (_.has(m.invitations, 'developmentTeam')) {
                    invIds = _.union(invIds, m.invitations.developmentTeam);
                }
                if (_.has(m.invitations, 'scrumMaster')) {
                    invIds = _.union(invIds, m.invitations.scrumMaster);
                }
            }
        });
        if (invIds.length > 0) {
            return Invitations.find({_id: {$in: invIds}});
        }
    }
    this.ready();
});

Meteor.publish('dashboardStatisticsPrivate', function () {
    var productIds = _.union(Roles.getRolesForUser(this.userId, "administrator"), Roles.getRolesForUser(this.userId, "developmentTeam"), Roles.getRolesForUser(this.userId, "productOwner"), Roles.getRolesForUser(this.userId, "scrumMaster"));
    if (productIds.length > 0) {
        return DashboardStatisticsPrivate.find({productId: {$in: productIds}});
    }
    this.ready();
});

Meteor.publish('dashboardStatistics', function () {
    return DashboardStatistics.find();
});

Meteor.publish('productStat', function () {
    var product = Products.findOne({}, {sort: {lastModified: -1}, limit: 1});
    return Stickies.find({productId: product._id}, {fields: {productId: 1, status: 1, assigneeId: 1}});
});

Meteor.publish('ownUser', function (userId) {
    return Users.find({_id: userId});
});

Meteor.publish('invitations', function (userId) {
    return Invitations.find({userId: userId}, {$and: [{status: 0}, {status: 1}]});
});

Meteor.publish('productInvitationData', function (userId) {
    let productIds = Invitations.find({userId: userId}, {$and: [{status: 0}, {status: 1}]}).map(function (invitations) {
        return invitations.productId;
    });
    return Products.find({_id: {$in: productIds}}, {fields: {title: 1, userId: 1}});
});

Meteor.publish('comments', function (slug) {
    var product = Products.findOne({slug: slug}),
        actElArr;
    if (product) {
        actElArr = [];
        ActivityStreamElements.find({productId: product._id}, {
            fields: {'_id': 1}
        }).forEach(function (actEl) {
            actElArr.push(actEl._id);
        });
        return Comments.find({actElId: {$in: actElArr}});
    }
    this.ready();
});

Meteor.publish('stickiesBasic', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Stickies.find({productId: product._id});
    }
    this.ready();
});

Meteor.publish('stickiesAdvanced', function (storyIds) {
    return Stickies.find({storyId: {$in: storyIds}});
});

Meteor.publish('stickiesAdvancedByProductSlug', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Stickies.find({productId: product._id});
    }
    this.ready();
});

Meteor.publish('userStoriesBasic', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return UserStories.find({productId: product._id});
    }
    this.ready();
});

Meteor.publish('userStoriesAdvanced', function (slug, startDate, endDate) {
    var product = Products.findOne({slug: slug}),
        sprint;
    if (product) {
        if (!product.advancedMode) {
            return this.ready();
        }
        sprint = Sprints.findOne({startDate: startDate, endDate: endDate, productId: product._id});
        if (sprint) {
            return UserStories.find({sprintId: sprint._id});
        }
    }
});

Meteor.publish('notifications', function (id) {
    return Notifications.find({_id: {$in: id}});
});

Meteor.publish(null, function () {
    return Users.find({_id: this.userId}, {
        fields: {
            notifications: 1,
            'settingsNotifications': 1,
            'privateMessages': 1
        }
    });
});

Meteor.publish('burndown', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Burndown.find({productId: product._id});
    }
    this.ready();
});

Meteor.publish('userProfile', function (username) {
    return Users.find({username: username}, {fields: {'profile': 1, 'username': 1, 'roles': 1}});
});

Meteor.publish('conversations', function (userId) {
    return Conversations.find({$or: [{'userId': userId}, {'recipients': userId}]});
});

Meteor.publish('usernames', function () {
    return Users.find({}, {
        fields: {'username': 1}
    });
});

Meteor.publish('conversation', function (slug) {
    return Conversations.find({slug: slug});
});

Meteor.publish('documents', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Documents.find({productId: product._id});
    }
    this.ready();
});

Meteor.publish('conversationParticipants', function (slug) {
    var conversations = Conversations.find({slug: slug}, {fields: {'recipients': 1}});
    if (conversations.count() == 1) return conversations;
    this.ready();
});

Meteor.publish('privateMessages', function (slug) {
    var conversation = Conversations.findOne({slug: slug});
    if (conversation) return PrivateMessages.find({conversationId: conversation._id});
    this.ready();
});

Meteor.publish('usersInvitationAuthors', function (userId) {
    let productIds = Invitations.find({userId: userId}).map(function (invitation) {
        return invitation.productId;
    });
    let userIds = Products.find({_id: {$in: productIds}}).map(function (product) {
        return product.userId;
    });
    return Users.find({_id: {$in: userIds}}, {
        fields: {
            'profile.image': 1,
            'username': 1,
            'profile.firstName': 1,
            'profile.lastName': 1,
            'profile.online': 1,
            'profile.color': 1
        }
    });
});

Meteor.publish('recipientsAvatars', function (slug) {
    let recipients = [];
    let conversation = Conversations.findOne({slug: slug});
    if (conversation) {
        recipients = _.union(recipients, conversation.recipients);
        recipients.push(conversation.userId);
        return Users.find({_id: {$in: recipients}}, {
            fields: {
                'profile.image': 1,
                'username': 1,
                'profile.online': 1,
                'profile.color': 1
            }
        });
    }
    this.ready();
});

Meteor.publishComposite('allRecipientsAvatarsInvolved', function (userId) {
    return {
        find: function () {
            return Conversations.find({$or: [{'userId': userId}, {'recipients': userId}]});
        },
        children: [
            {
                find: function (conversation) {
                    let recipients = conversation.recipients;
                    recipients.push(conversation.userId);
                    return Users.find({_id: {$in: recipients}}, {
                        fields: {
                            'profile.image': 1,
                            'username': 1,
                            'profile.online': 1,
                            'profile.color': 1
                        }
                    });
                }
            }
        ]
    }
});

Meteor.publish('usersInvited', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        let userIds = Invitations.find({productId: product._id}).map(function (invitation) {
            return invitation.userId;
        });
        return Users.find({_id: {$in: userIds}}, {
            fields: {
                'profile.image': 1,
                'username': 1,
                'roles': 1,
                'profile.online': 1,
                'profile.color': 1
            }
        });
    }
    this.ready();
});