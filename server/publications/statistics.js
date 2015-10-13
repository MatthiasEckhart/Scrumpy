"use strict";

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
        else this.ready();
    } else this.ready();
});

Meteor.publish('dashboardStatisticsPrivate', function () {
    var productIds = _.union(Roles.getRolesForUser(this.userId, "administrator"), Roles.getRolesForUser(this.userId, "developmentTeam"), Roles.getRolesForUser(this.userId, "productOwner"), Roles.getRolesForUser(this.userId, "scrumMaster"));
    if (productIds.length > 0) return DashboardStatisticsPrivate.find({productId: {$in: productIds}});
    else this.ready();
});

Meteor.publish('dashboardStatistics', function () {
    return DashboardStatistics.find();
});