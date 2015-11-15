"use strict";

Template.productDashboard.helpers({
    totalStickies: function () {
        let userStoryIds = UserStories.find({productId: this._id}).map((story) => story._id);
        return Stickies.find({storyId: {$in: userStoryIds}}).count();
    },
    totalUserStories: function () {
        return UserStories.find({productId: this._id}).count();
    },
    totalScrumTeamMembers: function () {
        var sum = 1; // Product Owner
        sum += Roles.getUsersInRole([this._id], "scrumMaster").count();
        sum += Roles.getUsersInRole([this._id], "developmentTeam").count();
        return sum;
    },
    burndownDataAvailable: function () {
        let userStoryIds = UserStories.find({productId: this._id}).map((story) => story._id);
        return Sprints.find({
                productId: this._id,
                startDate: {$lte: new Date()},
                endDate: {$gte: new Date()}
            }).count() > 0 && Stickies.find({storyId: {$in: userStoryIds}}).count() > 0;
    },
    barChartDataAvailable: function () {
        let userStoryIds = UserStories.find({productId: this._id}).map((story) => story._id);
        return Stickies.find({storyId: {$in: userStoryIds}}).count() > 0;
    },
    velocity: function () {
        var sumStoryPoints = 0, sumSprints, velocity;
        UserStories.find({
            productId: this._id,
            sprintId: {$exists: true},
            storyPoints: {$exists: true}
        }).forEach(function (story) {
            sumStoryPoints += parseFloat(story.storyPoints);
        });
        sumSprints = Sprints.find({productId: this._id}).count();
        velocity = sumStoryPoints / sumSprints;
        if (_.isNaN(velocity)) {
            return "0";
        }
        return velocity;
    },
    sprintsAvailable: function () {
        return Sprints.find({productId: this._id}).count() > 0;
    }
});

Template.productDashboard.onRendered(function () {
    Session.set('activeNavTab', 'productDashboard');
    if (Session.equals('noSprintsError', true)) {
        throwAlert('error', 'Ooops!', 'You cannot access the task board, because there are no sprints!');
    }
});

Template.productDashboard.onDestroyed(function () {
    Session.set('noSprintsError', false);
});