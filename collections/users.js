Users = Meteor.users;

EasySearch.createSearchIndex('users', {
    'field': ['username'],
    'collection': Users,
    'limit': 20,
    'query': function (searchString) {
        // Default query that will be used for searching
        var query = EasySearch.getSearcher(this.use).defaultQuery(this, searchString);
        // Do not include own user in search
        if (Meteor.user()) {
            query.username = {$ne: Meteor.user().username};
        }
        return query;
    }
});

Users.deny({
    insert: denyPermission,
    update: denyPermission,
    remove: denyPermission
});

Users.before.insert(function (userId, doc) {
    var dashboardStats = DashboardStatistics.findOne();
    DashboardStatistics.update({_id: dashboardStats._id}, {$inc: {totalUsers: 1}});
});

Meteor.methods({
    markAllNotificationsAsRead: function (userId) {
        if (Meteor.isServer) {
            var userNotifications = Users.findOne({_id: userId}).notifications;
            // removing all references
            Users.update({_id: userId}, {$set: {notifications: []}});
            _.each(userNotifications, function (item) {
                if (Users.find({notifications: {$in: [item]}}).count() === 0) {
                    // no users with this notification -> delete main notification
                    Notifications.remove({_id: item});
                }
            });
        }
    },
    markSingleNotificationAsRead: function (userId, notificationId) {
        if (Meteor.isServer) {
            // removing reference
            Users.update({_id: userId}, {$pull: {notifications: notificationId}});
            if (Users.find({notifications: {$in: [notificationId]}}).count() === 0) {
                // no users with this notification -> delete main notification
                Notifications.remove({_id: notificationId});
            }
        }
    },
    setDefaultAvatar: function (userId) {
        if (Meteor.isServer) {
            Users.update({_id: userId}, {$set: {'profile.image': ""}});
        }
    },
    updateAvatar: function (base64) {
        if (Meteor.isServer) {
            var id = this.userId;
            if (!id) {
                throw new Meteor.Error(403, "You must be logged in.");
            }
            try {
                validateImgBase64(base64);
                return Meteor.users.update({_id: id}, {$set: {'profile.image': base64}});
            } catch (e) {
                throw new Meteor.Error(403, e.message);
            }
        }
    },
    updatePersInfo: function (userId, info) {
        if (Meteor.isServer) {
            var sumOrg = Users.find({'profile.organization': info["profile.organization"]}).count(),
                user = Users.findOne({_id: userId}),
                dashboardStats;
            Users.update({_id: userId}, {$set: info});
            dashboardStats = DashboardStatistics.findOne();
            // profile organization attribute is not empty
            if (!_.isEmpty(info["profile.organization"])) {
                // no user with the same organization exists (increase counter)
                if (sumOrg == 0) {
                    DashboardStatistics.update({_id: dashboardStats._id}, {$inc: {totalOrganizations: 1}});
                }
            } else {
                // profile organization attribute is empty
                if (user.profile.organization) {
                    // user had organization set (decrease counter)
                    DashboardStatistics.update({_id: dashboardStats._id}, {$inc: {totalOrganizations: -1}});
                }
            }
        }
    },
    updateUserColor: function (userId, color) {
        if (Meteor.isServer) {
            Users.update({_id: userId}, {$set: {"profile.color": color}});
        }
    }
});

Meteor._onLogin  = function () {
    var dashStats = DashboardStatistics.findOne();
    // increase public dashboard statistics counter onLogin
    DashboardStatistics.update({_id: dashStats._id}, {$inc: {totalUsersOnline: 1}});
};

Meteor._onLogout = function () {
    var dashStats = DashboardStatistics.findOne();
    // decrease public dashboard statistics counter onLogout
    DashboardStatistics.update({_id: dashStats._id}, {$inc: {totalUsersOnline: -1}});
};

function validateImgBase64(src) {
    if (!/^data:image\/png;base64,/i.test(src)) {
        throw new Error("Image decoding error.");
    }
    return true;
}