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
            return [Products.find({_id: {$in: productIds}}, {fields: {advancedMode: 1, author: 1}}), Sprints.find({author: user.username}, {fields: {author: 1}}), UserStories.find({author: user.username}, {fields: {author: 1}}), Stickies.find({author: user.username}, {fields: {author: 1}})];
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

Meteor.publish('invitations', function (slug) {
    var product = Products.findOne({slug: slug}),
        invIds = [],
        pm;
    if (product) {
        pm = PrivateMessages.findOne({productId: product._id});
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

Meteor.publish('ownUser', function (id) {
    return Users.find({_id: id});
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

Meteor.reactivePublish('privateMessages', function (userId) {
    var user = Users.findOne({_id: userId}, {reactive: true});
    if (user) {
        return PrivateMessages.find({_id: {$in: user.privateMessages}}, {reactive: true});
    }
    this.ready();
});

Meteor.publish('privateMessageForProduct', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return PrivateMessages.find({productId: product._id});
    }
    this.ready();
});

Meteor.publish('usernames', function () {
    return Users.find({}, {
        fields: {'username': 1}
    });
});

Meteor.publish('privateMessage', function (slug) {
    var pm = PrivateMessages.find({slug: slug});
    if (pm.count() > 0) {
        return pm;
    }
    this.ready();
});

Meteor.publish('documents', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Documents.find({productId: product._id});
    }
    this.ready();
});

Meteor.publish('privateMessageParticipants', function (slug) {
    var pm = PrivateMessages.find({slug: slug}, {fields: {'participants': 1}});
    if (pm.count() > 0) {
        return pm;
    }
    this.ready();
});

Meteor.publish('participantsAvatars', function (slug) {
    var pm = PrivateMessages.findOne({slug: slug});
    if (pm) {
        return Users.find({_id: {$in: pm.participants}}, {
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

Meteor.reactivePublish('allParticipantsAvatarsInvolved', function (userId) {
    var user = Users.findOne({_id: userId}, {reactive: true}),
        participantsArr;
    if (user) {
        participantsArr = [];
        PrivateMessages.find({_id: {$in: user.privateMessages}}, {reactive: true}).forEach(function (message) {
            participantsArr = _.union(participantsArr, message.participants);
        });
        return Users.find({_id: {$in: participantsArr}}, {
            fields: {
                'profile.image': 1,
                'username': 1,
                'profile.online': 1,
                'profile.color': 1
            }
        }, {reactive: true});
    }
    this.ready();
});

Meteor.publish('usersInProductRole', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) {
        return Users.find(
            {
                $or: [
                    {'roles.administrator': {$in: [product._id]}},
                    {'roles.developmentTeam': {$in: [product._id]}},
                    {'roles.scrumMaster': {$in: [product._id]}},
                    {'roles.productOwner': {$in: [product._id]}}
                ]
            }, {fields: {'profile.image': 1, 'username': 1, 'roles': 1, 'profile.online': 1, 'profile.color': 1}});
    }
    this.ready();
});

Meteor.publish('usersDeclinedInv', function (slug) {
    var product = Products.findOne({slug: slug}),
        usrDeclinedInvIds = [];
    if (product) {
        ActivityStreamElements.find({productId: product._id, status: 0}).forEach(function (act) {
            usrDeclinedInvIds.push(act.userId);
        });
        return Users.find({_id: {$in: usrDeclinedInvIds}});
    }
    this.ready();
});