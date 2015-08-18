"use strict";

Template.sprintPlanning.helpers({
    userStoriesNoPrioritization: function () {
        return UserStories.find({
            productId: this._id,
            sprintId: {$exists: false},
            priority: {$exists: false}
        }).map(function (userStory) {
            userStory.isDrag = true;
            return userStory;
        });
    },
    userStoriesProductBacklog: function () {
        return UserStories.find({
            productId: this._id,
            sprintId: {$exists: false},
            priority: {$exists: true}
        }, {sort: {priority: 1}}).map(function (userStory) {
            userStory.isDrag = true;
            return userStory;
        });
    },
    sprints: function () {
        return Sprints.find({productId: this._id});
    },
    noSprints: function () {
        return Sprints.find({productId: this._id}).count() === 0;
    },
    userIsProductOwner: function () {
        return Roles.userIsInRole(Meteor.user(), [this._id], 'productOwner');
    }
});

Template.sprintPlanning.events({
    'click .new-story-submit': function (e, t) {
        e.preventDefault();
        var newStoryTitleInput = t.find('[name=new-story-title-input]'),
            titleInputValue = $.trim(newStoryTitleInput.value),
            newStoryDescInput = t.find('[name=new-story-description-input]'),
            descInputValue = $.trim(newStoryDescInput.value),
            newStory;

        if (titleInputValue.length > 0 && descInputValue.length > 0) {
            newStory = {
                userId: Meteor.userId(),
                title: titleInputValue,
                description: descInputValue,
                productId: this._id,
                submitted: new Date(),
                author: Meteor.user().username,
                lastEdited: Meteor.user().username
            };
            createStory(newStory, newStoryTitleInput, newStoryDescInput);
            Meteor.call('createActElUserStory', newStory.productId, Meteor.user()._id, newStory.title, function (error) {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return null;
                }
            });
            Session.set("staleUserStoryOrSprint", true);
        } else {
            alert('Choose a title that reflect the feature to be implemented', 'Choose a title');
        }
    }
});

Template.sprintPlanning.rendered = function () {
    Session.set('activeNavTab', 'sprintPlanning');

    REDIPS.drag.init();
    REDIPS.drag.hover.colorTd = 'rgba(0, 116, 147, 0.3)';
    // reference to the REDIPS.drag library
    var rd = REDIPS.drag,
        productId = this.data._id;
    // define event.dropped handler
    rd.event.dropped = function () {
        var storyId = rd.obj.getAttribute('id'),
            curr = $(rd.td.current),
            src = $(rd.td.source),
            countPrio,
            priority,
            staleStory,
            freshStory,
            currStory,
            storyAct;
        if (rd.td.current != rd.td.previous) {
            if (curr.attr('class').indexOf("user-stories-product-backlog-new-field") >= 0 && src.attr('class').indexOf("user-stories-no-prioritization") >= 0) { // check movement: From User Stories to Product Backlog prioritize field
                countPrio = UserStories.find({productId: productId, priority: {$exists: true}}).count();
                UserStories.update({_id: storyId}, {$set: {priority: countPrio + 1}});
                rd.deleteObject(rd.obj);
                storyAct = UserStories.findOne({_id: storyId});
                Meteor.call('createActElUserStoryPrioritized', productId, Meteor.userId(), storyAct.title, storyAct.priority, function (error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });
            } else if (curr.attr('class').indexOf("user-stories-product-backlog") >= 0 && src.attr('class').indexOf("user-stories-no-prioritization") >= 0) { // check movement: From User Stories to prioritized Product Backlog field
                priority = parseInt(curr.attr('id'));
                staleStory = UserStories.findOne({priority: priority});
                UserStories.update({_id: staleStory._id}, {$unset: {priority: true}});
                UserStories.update({_id: storyId}, {$set: {priority: priority}});
            } else if (curr.attr('class').indexOf("user-stories-no-prioritization") >= 0 && src.attr('class').indexOf("user-stories-product-backlog") >= 0) { // check movement: From prioritized Product Backlog field to User Stories
                UserStories.find({
                    productId: productId,
                    priority: {$gt: parseInt(src.attr('id'))}
                }).forEach(function (story) {
                    UserStories.update({_id: story._id}, {$set: {priority: (story.priority - 1)}});
                });
                UserStories.update({_id: storyId}, {$unset: {priority: true}});
                rd.deleteObject(rd.obj);
            } else if (curr.attr('class').indexOf("user-stories-product-backlog") >= 0 && src.attr('class').indexOf("user-stories-product-backlog") >= 0) { // check movement: From prioritized Product Backlog field to other prioritized Product Backlog field
                staleStory = UserStories.findOne({priority: parseInt(src.attr('id'))});
                UserStories.update({_id: storyId}, {$set: {priority: staleStory.priority}});
                UserStories.find({
                    productId: productId,
                    priority: {$gt: parseInt(src.attr('id'))}
                }).forEach(function (story) {
                    UserStories.update({_id: story._id}, {$set: {priority: (story.priority - 1)}});
                });
                UserStories.update({_id: staleStory._id}, {$unset: {priority: true}});
                rd.deleteObject(rd.obj);
            } else if (curr.attr('class').indexOf("user-story-sprint") >= 0 && src.attr('class').indexOf("user-stories-product-backlog") >= 0) { // check movement: From prioritized Product Backlog field to sprint
                UserStories.update({_id: storyId}, {$set: {sprintId: curr.attr('id')}});
                rd.deleteObject(rd.obj);
            } else if (curr.attr('class').indexOf("user-story-sprint") >= 0 && src.attr('class').indexOf("user-stories-no-prioritization") >= 0) { // check movement: From User Stories to sprint
                rd.moveObject({
                    id: storyId,
                    target: [0, 0, 0],
                    callback: function () {
                        throwAlert("error", "Sorry!", "You need to prioritize the user story first!");
                    }
                });
            } else if (curr.attr('class').indexOf("user-stories-product-backlog-new-field") >= 0 && src.attr('class').indexOf("user-story-sprint") >= 0) { // check movement: From sprint to Product Backlog prioritize field
                UserStories.update({_id: storyId}, {$unset: {sprintId: true}});
                rd.deleteObject(rd.obj);
            } else if (curr.attr('class').indexOf("user-stories-product-backlog") >= 0 && src.attr('class').indexOf("user-story-sprint") >= 0) { // check movement: From sprint to Product Backlog prioritize field
                staleStory = UserStories.findOne({priority: parseInt(curr.attr('id'))});
                freshStory = UserStories.findOne({_id: storyId});
                UserStories.update({_id: storyId}, {$set: {priority: staleStory.priority}, $unset: {sprintId: true}});
                UserStories.update({_id: staleStory._id}, {$unset: {priority: true}});
                UserStories.find({
                    productId: productId,
                    priority: {$gt: freshStory.priority}
                }).forEach(function (story) {
                    UserStories.update({_id: story._id}, {$set: {priority: (story.priority - 1)}});
                });
                rd.deleteObject(rd.obj);
            } else if (curr.attr('class').indexOf("user-stories-no-prioritization") >= 0 && src.attr('class').indexOf("user-story-sprint") >= 0) { // check movement: From sprint to User Stories
                currStory = UserStories.findOne({_id: storyId});
                UserStories.find({productId: productId, priority: {$gt: currStory.priority}}).forEach(function (story) {
                    UserStories.update({_id: story._id}, {$set: {priority: (story.priority - 1)}});
                });
                UserStories.update({_id: storyId}, {$unset: {sprintId: true, priority: true}});
                rd.deleteObject(rd.obj);
            } else if (curr.attr('class').indexOf("user-story-sprint") >= 0 && src.attr('class').indexOf("user-story-sprint") >= 0) { // check movement: From sprint to sprint
                UserStories.update({_id: storyId}, {$set: {sprintId: curr.attr('id')}});
                rd.deleteObject(rd.obj);
            }
        } else {
            // User story location not changed -> place user story back to user story container
            staleStory = UserStories.findOne({priority: parseInt(src.attr('id'))});
            UserStories.update({_id: storyId}, {$set: {priority: staleStory.priority}});
            UserStories.find({
                productId: productId,
                priority: {$gt: parseInt(src.attr('id'))}
            }).forEach(function (story) {
                UserStories.update({_id: story._id}, {$set: {priority: (story.priority - 1)}});
            });
            UserStories.update({_id: staleStory._id}, {$unset: {priority: true}});
            rd.deleteObject(rd.obj);
        }
    };
};