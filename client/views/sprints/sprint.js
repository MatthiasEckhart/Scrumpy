"use strict";

Template.sprint.onRendered(function () {
    REDIPS.drag.init();
});

Template.sprint.helpers({
    userStories: function () {
        return UserStories.find({
            sprintId: this._id,
            priority: {$exists: true}
        }, {sort: {priority: 1}}).map((userStory) => {
            userStory.isDrag = true;
            return userStory;
        });
    },
    sumBusinessValue: function () {
        let sumBusinessValue = 0;
        UserStories.find({
            sprintId: this._id,
            businessValue: {$exists: true}
        }).forEach((story) => sumBusinessValue += parseInt(story.businessValue));
        return sumBusinessValue;
    },
    sumStoryPoints: function () {
        let sumStoryPoints = 0;
        UserStories.find({
            sprintId: this._id,
            storyPoints: {$exists: true}
        }).forEach((story) => sumStoryPoints += parseFloat(story.storyPoints));
        return sumStoryPoints;
    }
});

Template.sprint.events({
    'click .delete-sprint': function (e) {
        e.preventDefault();
        throwDialog('warning', 'Wait!', 'Are you sure you want delete the sprint ' + this.goal + '?', 'Sure, delete it', 'No, do not delete', 'delete-sprint-confirm', this);
    }
});