"use strict";

Template.sprint.rendered = function () {
    REDIPS.drag.init();
    var sprintId = this.data._id,
        productId = this.data.productId;
    if (Roles.userIsInRole(Meteor.user(), [productId], 'scrumMaster')) {
        $('.editable-sprint-goal').editable({
            display: false,
            title: "Update sprint goal",
            validate: function (value) {
                if ($.trim(value) === '') {
                    return 'Please fill in a sprint goal.';
                }
            },
            success: function (response, newValue) {
                if (newValue) {
                    var oldSprintGoal = Sprints.findOne({_id: sprintId}).goal;
                    Sprints.update({_id: sprintId}, {$set: {goal: newValue}});
                    throwAlert('success', 'Yes!', 'Sprint goal edited.');
                    Meteor.call('createActElSprintEditGoal', productId, Meteor.user()._id, oldSprintGoal, newValue, function (error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                    });
                }
            }
        });
        $('.editable-sprint-start-date').editable({
            display: false,
            title: "Update sprint start date",
            format: 'yyyy-mm-dd',
            datepicker: {
                weekStart: 1
            },
            validate: function (value) {
                if ($.trim(value) === '') {
                    return 'Please fill in a sprint start date.';
                }
                if (moment(value).isAfter(Sprints.findOne({_id: sprintId}).endDate)) {
                    return 'Sprint start date is after end date.';
                }
            },
            success: function (response, newValue) {
                if (newValue) {
                    var oldSprintStartDate = Sprints.findOne({_id: sprintId}).startDate;
                    Sprints.update({_id: sprintId}, {$set: {startDate: newValue}});
                    throwAlert('success', 'Yes!', 'Sprint start date edited.');
                    Meteor.call('createActElSprintEditStartDate', productId, Meteor.user()._id, oldSprintStartDate, newValue, function (error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                    });
                }
            }
        });
        $('.editable-sprint-end-date').editable({
            display: false,
            title: "Update sprint end date",
            format: 'yyyy-mm-dd',
            datepicker: {
                weekStart: 1
            },
            validate: function (value) {
                if ($.trim(value) === '') {
                    return 'Please fill in a sprint end date.';
                }
                if (moment(value).isBefore(Sprints.findOne({_id: sprintId}).startDate)) {
                    return 'Sprint end date is before end date.';
                }
            },
            success: function (response, newValue) {
                if (newValue) {
                    var oldSprintEndDate = Sprints.findOne({_id: sprintId}).endDate;
                    Sprints.update({_id: sprintId}, {$set: {endDate: newValue}});
                    throwAlert('success', 'Yes!', 'Sprint end date edited.');
                    Meteor.call('createActElSprintEditEndDate', productId, Meteor.user()._id, oldSprintEndDate, newValue, function (error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                    });
                }
            }
        });
    }
};

Template.sprint.helpers({
    userStories: function () {
        return UserStories.find({
            sprintId: this._id,
            priority: {$exists: true}
        }, {sort: {priority: 1}}).map(function (userStory) {
            userStory.isDrag = true;
            return userStory;
        });
    },
    sumBusinessValue: function() {
        var sumBusinessValue = 0;
        UserStories.find({sprintId: this._id, businessValue: {$exists: true}}).forEach(function(story) {
            sumBusinessValue += parseInt(story.businessValue);
        });
        return sumBusinessValue;
    },
    sumStoryPoints: function() {
        var sumStoryPoints = 0;
        UserStories.find({sprintId: this._id, storyPoints: {$exists: true}}).forEach(function(story) {
            sumStoryPoints += parseFloat(story.storyPoints);
        });
        return sumStoryPoints;
    }
});

Template.sprint.events({
    'click .delete-sprint': function (e) {
        e.preventDefault();
        throwDialog('warning', 'Wait!', 'Are you sure you want delete the sprint ' + this.goal + '?', 'Sure, delete it', 'No, do not delete', 'delete-sprint-confirm', this);
    }
});