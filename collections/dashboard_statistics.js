// Public statistics for dashboard
DashboardStatistics = new Meteor.Collection('dashboardStatistics');

if (Meteor.isServer) {
    Meteor.startup(function () {
        if (DashboardStatistics.find().count() === 0) {
            DashboardStatistics.insert({
                totalProducts: 0,
                totalUsers: 0,
                totalOrganizations: 0,
                totalTasksTodo: 0,
                totalTasksStarted: 0,
                totalTasksVerify: 0,
                totalTasksDone: 0,
                totalTasksAssigned: 0,
                totalDevTime: 0,
                totalUsersOnline: 0
            });
        }
    });
}

// updateDashboardStatisticsTotalTasksStatus function located in /collections/stickies.js