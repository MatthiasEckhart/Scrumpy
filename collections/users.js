Users = Meteor.users;

Users.deny({
    insert: denyPermission,
    update: denyPermission,
    remove: denyPermission
});

Users.before.insert(function (userId, doc) {
    var dashboardStats = DashboardStatistics.findOne();
    DashboardStatistics.update({_id: dashboardStats._id}, {$inc: {totalUsers: 1}});
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