"use strict";

var routerStartDate, routerEndDate;

Template.taskBoardPage.helpers({
    userIsAdmin: function () {
        return Roles.userIsInRole(Meteor.user(), [this._id], 'administrator');
    },
    noStories: function () {
        var sum = 0;
        if (productIsAdvancedModeStartDateEndDate(this.advancedMode)) {
            sum = UserStories.find({
                productId: this._id,
                sprintId: getSprintId(this._id, routerStartDate, routerEndDate)
            }).count();
        } else {
            sum = UserStories.find({productId: this._id}).count();
        }
        return sum === 0;
    }
});

Template.taskBoardPage.events({
    'click #export-taskboard-as-pdf': () => startPDFExportingProcess()
});

Template.taskBoard.onCreated(function () {
    if (productIsAdvancedModeStartDateEndDate(this.data.advancedMode)) {
        routerStartDate = moment.utc(Router.current().params.startDate).toDate();
        routerEndDate = moment.utc(Router.current().params.endDate).toDate();
    }
});

Template.taskBoard.onRendered(function () {
    if (productIsAdvancedModeStartDateEndDate(this.data.advancedMode) && UserStories.find({
            productId: this.data._id,
            sprintId: getSprintId(this.data._id, routerStartDate, routerEndDate)
        }).count() == 0) {
        Session.set('noUserStories', true);
        Router.go('sprintPlanning', {slug: this.data.slug});
    }
});