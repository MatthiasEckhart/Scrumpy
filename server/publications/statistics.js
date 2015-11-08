"use strict";

Meteor.publish('statisticsForProfilePage', function (username) {
    var user = Users.findOne({username: username}),
        productIds;
    if (user) {
        productIds = _.union(
            Roles.getRolesForUser(user._id, "administrator"),
            Roles.getRolesForUser(user._id, "developmentTeam"),
            Roles.getRolesForUser(user._id, "productOwner"),
            Roles.getRolesForUser(user._id, "scrumMaster")
        );
        if (productIds.length > 0) {
            return [
                Products.find({_id: {$in: productIds}}, {fields: {advancedMode: 1, userId: 1}}),
                Sprints.find({userId: user._id}, {fields: {userId: 1}}),
                UserStories.find({userId: user._id}, {fields: {userId: 1}}),
                Stickies.find({userId: user._id}, {fields: {userId: 1}})
            ];
        }
        else this.ready();
    } else this.ready();
});

Meteor.publishComposite('dashboardStatisticsPrivateByInvitation', function () {
    return {
        find: function () {
            return Invitations.find({userId: this.userId, status: 1});
        },
        children: [
            {
                find: function (invitation) {
                    return DashboardStatisticsPrivate.find({productId: invitation.productId});
                }
            }
        ]
    }
});

Meteor.publishComposite('dashboardStatisticsPrivateByProductUserId', function () {
    return {
        find: function () {
            return Products.find({userId: this.userId});
        },
        children: [
            {
                find: function (product) {
                    return DashboardStatisticsPrivate.find({productId: product._id});
                }
            }
        ]
    }
});