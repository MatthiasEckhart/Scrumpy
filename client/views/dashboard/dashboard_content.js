"use strict";

Template.dashboardContent.helpers({
    totalUsers: function () {
        return parseInt(DashboardStatistics.findOne().totalUsers, 10);
    },
    totalProducts: function () {
        return parseInt(DashboardStatistics.findOne().totalProducts, 10);
    },
    totalTasksDone: function () {
        return parseInt(DashboardStatistics.findOne().totalTasksDone, 10);
    },
    totalOrganizations: function () {
        return parseInt(DashboardStatistics.findOne().totalOrganizations, 10);
    },
    emptyProducts: function () {
        return _.union(Roles.getRolesForUser(Meteor.userId(), "developmentTeam"), Roles.getRolesForUser(Meteor.userId(), "productOwner"), Roles.getRolesForUser(Meteor.userId(), "scrumMaster"), Roles.getRolesForUser(Meteor.userId(), "administrator")).length === 0;
    },
    totalProductsUser: function () {
        return Products.find().count();
    },
    productStatTitle: function (type) {
        var product = Products.findOne({_id: Session.get(type)});
        if (product) {
            return product.title;
        }
    },
    oneProductExist: function () {
        return Products.find().count() >= 1;
    },
    openTasks: function (type) {
        if (type === "all") {
            var stats = DashboardStatistics.findOne();
            return parseInt(stats.totalTasksTodo, 10) + parseInt(stats.totalTasksStarted, 10) + parseInt(stats.totalTasksVerify, 10);
        } // type -> productStat
        return Stickies.find({productId: Session.get(type), status: {$in: [1, 2, 3]}}).count();
    },
    tasksAssigned: function (type) {
        if (type === "me") {
            return Stickies.find({productId: Session.get("productStat"), assigneeId: Meteor.userId()}).count();
        } // type -> total
        return DashboardStatistics.findOne().totalTasksAssigned;
    },
    totalTasksTodo: function () {
        return DashboardStatistics.findOne().totalTasksTodo;
    },
    totalTasksDoneForProduct: function () {
        return Stickies.find({productId: Session.get("productStat"), status: 4}).count();
    },
    totalUsersOnline: function () {
        return DashboardStatistics.findOne().totalUsersOnline;
    },
    totalDevTime: function () {
        return DashboardStatistics.findOne().totalDevTime;
    }
});

Template.dashboardContent.events({
    'click .new-conversation': function (e) {
        e.preventDefault();
        Router.go('privateMessageCreate');
    }
});

Template.dashboardContent.rendered = function () {
    this.autorun(function () {
        if (Template.currentData() && parseInt(DashboardStatistics.findOne().totalUsers, 10) && parseInt(DashboardStatistics.findOne().totalProducts, 10) && parseInt(DashboardStatistics.findOne().totalTasksDone, 10) && parseInt(DashboardStatistics.findOne().totalOrganizations, 10)) {
            $('.counter').counterUp({
                delay: 10,
                time: 500
            });
        }
    });
};