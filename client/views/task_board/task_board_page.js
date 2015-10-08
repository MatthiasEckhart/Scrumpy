"use strict";

Template.taskBoardPage.helpers({
    userIsAdmin: function () {
        return Roles.userIsInRole(Meteor.user(), [this._id], 'administrator');
    },
    noStories: function () {
        var sum = 0;
        if (productIsAdvancedModeStartDateEndDate(this.advancedMode)) {
            sum += UserStories.find({productId: this._id, sprintId: getSprintId(this._id)}).count();
        } else {
            sum += UserStories.find({productId: this._id}).count();
        }
        return sum === 0;
    }
});

Template.taskBoardPage.events({
    'click #export-taskboard-as-pdf': function () {
        startPDFExportingProcess();
    }
});