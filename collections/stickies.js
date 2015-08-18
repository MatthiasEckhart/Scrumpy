Stickies = new Meteor.Collection('stickies');

Stickies.allow({
    insert: scrumTeam,
    update: scrumTeam,
    remove: scrumTeam
});

Stickies.before.insert(function (userId, doc) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
        updateDashboardStatisticsTotalTasksStatus(1, '1');
        DashboardStatistics.update({_id: DashboardStatistics.findOne()._id}, {$inc: {totalDevTime: doc.effort}});
    }
});

Stickies.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.lastModified = new Date();
    // check if sticky status is already updated
    if (fieldNames[0] === "status") {
        // sticky has still old status, decrease "old-status-counter"
        updateDashboardStatisticsTotalTasksStatus(doc.status, "-1");
    } else if (fieldNames[0] === "storyId") {
        // sticky has new status, increase "new-status-counter"
        updateDashboardStatisticsTotalTasksStatus(doc.status, "1");
    } else if (fieldNames[0] === "assigneeId") {
        // sticky has been assigned to user
        if (Meteor.isServer) {
            DashboardStatistics.update({_id: DashboardStatistics.findOne()._id}, {$inc: {totalTasksAssigned: 1}});
            updateLastModifiedForProduct(doc.productId);
        }
    }
});

Stickies.after.update(function (userId, doc, fieldNames, modifier, options) {
    if (fieldNames[0] === "effort" && Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
        // sticky effort modified
        var dashStats = DashboardStatistics.findOne();
        if (dashStats) {
            // subtract previous sticky effort from DashboardStatistics counter
            DashboardStatistics.update({_id: dashStats._id}, {$inc: {totalDevTime: -this.previous.effort}});
            // add new sticky effort to DashboardStatistics counter
            DashboardStatistics.update({_id: dashStats._id}, {$inc: {totalDevTime: doc.effort}});
        }
    }
}, {fetchPrevious: true});

Stickies.before.remove(function (userId, doc) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
        updateDashboardStatisticsTotalTasksStatus(doc.status, '-1');
        DashboardStatistics.update({_id: DashboardStatistics.findOne()._id}, {$inc: {totalDevTime: -doc.effort}});
    }
});

function updateDashboardStatisticsTotalTasksStatus(statusVal, type) {
    if (Meteor.isServer) {
        var status = {},
            statusKey,
            dashboardStats;
        switch (statusVal) {
            case 1:
                statusKey = "totalTasksTodo";
                break;
            case 2:
                statusKey = "totalTasksStarted";
                break;
            case 3:
                statusKey = "totalTasksVerify";
                break;
            case 4:
                statusKey = "totalTasksDone";
                break;
        }
        status[statusKey] = parseInt(type, 10);
        dashboardStats = DashboardStatistics.findOne();
        DashboardStatistics.update({_id: dashboardStats._id}, {$inc: status});
    }
}