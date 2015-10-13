"use strict";

var storyId, productId, routerStartDate, routerEndDate;

Template.taskBoard.helpers({
    userStories: function () {
        if (productIsAdvancedModeStartDateEndDate(this.advancedMode)) {
            return UserStories.find({
                productId: this._id,
                sprintId: getSprintId(this._id, routerStartDate, routerEndDate)
            }, {sort: {priority: 1}});
        }
        return UserStories.find({productId: this._id});
    },
    stickyType: function (type) {
        return Stickies.find({storyId: this._id, status: parseInt(type, 10)}, {sort: {lastModified: -1}});
    },
    sumEffort: function (type) {
        var sumEffort = 0,
            userStoryIdsArr;
        if (productIsAdvancedModeStartDateEndDate(this.advancedMode)) {
            userStoryIdsArr = [];
            UserStories.find({
                productId: this._id,
                sprintId: getSprintId(this._id, routerStartDate, routerEndDate)
            }).forEach(function (story) {
                userStoryIdsArr.push(story._id);
            });
            Stickies.find({
                productId: this._id,
                storyId: {$in: userStoryIdsArr},
                status: parseInt(type, 10)
            }).forEach(function (sticky) {
                sumEffort += parseInt(sticky.effort, 10);
            });
        } else {
            Stickies.find({productId: this._id, status: parseInt(type, 10)}).forEach(function (sticky) {
                sumEffort += parseInt(sticky.effort, 10);
            });
        }
        return sumEffort;
    }
});

Template.taskBoard.onCreated(function () {
    if (productIsAdvancedModeStartDateEndDate(this.data.advancedMode)) {
        routerStartDate = moment.utc(Router.current().params.startDate).toDate();
        routerEndDate = moment.utc(Router.current().params.endDate).toDate();
    }
});