"use strict";

Template.dialogs.helpers({
    dialogs: function () {
        return Dialogs.find();
    },
    type: function (type) {
        return this.type === type;
    },
    message: function () {
        return this.message;
    },
    details: function () {
        return this.details;
    },
    actionButton: function () {
        return this.actionButton;
    },
    link: function () {
        return this.link;
    }
});

Template.dialogs.events({
    'click .close': function () {
        Dialogs.remove(this._id);
    },
    'click .delete-product-confirm': function () {
        var dialogId = this._id;
        Meteor.call('deleteProduct', this.data, function (error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
            Dialogs.remove(dialogId);
            Router.go('dashboard');
        });
    },
    'click .delete-sticky-confirm': function () {
        var product = Products.findOne({_id: this.data.productId}), stickyTitle = this.data.title;
        Stickies.remove({_id: this.data._id});
        if (product.advancedMode) {
            Meteor.call('updateBurndown', product._id, function (err) {
                if (err) {
                    throwAlert("error", "Error!", err);
                }
            });
            Meteor.call('createActElStickyRemoved', product._id, Meteor.user()._id, stickyTitle, function (err) {
                if (err) {
                    throwAlert("error", "Error!", err);
                }
            });
        }
        Dialogs.remove(this._id);
        throwAlert('success', 'Yeah!', 'Sticky removed.');
    },
    'click .delete-user-story-confirm': function () {
        var product = Products.findOne({_id: this.data.productId}), storyTitle = this.data.title;
        Stickies.find({storyId: this.data._id}).forEach(function (sticky) {
            Stickies.remove({_id: sticky._id});
        });
        UserStories.find({
            productId: this.data.productId,
            priority: {$gt: this.data.priority}
        }).forEach(function (story) {
            UserStories.update({_id: story._id}, {$set: {priority: (story.priority - 1)}});
        });
        UserStories.remove({_id: this.data._id});
        if (product.advancedMode) {
            Meteor.call('updateBurndown', this.data.sprintId, function (err) {
                if (err) {
                    throwAlert("error", "Error!", err);
                }
            });
            Meteor.call('createActElUserStoryRemoved', product._id, Meteor.user()._id, storyTitle, function (err) {
                if (err) {
                    throwAlert("error", "Error!", err);
                }
            });
        }
        Dialogs.remove(this._id);
        throwAlert('success', 'Yeah!', 'User story removed.');
    },
    'click .delete-sprint-confirm': function () {
        var product = Products.findOne({_id: this.data.productId}), sprintGoal = this.data.goal;
        UserStories.find({sprintId: this.data._id}).forEach(function (userStory) {
            Stickies.find({storyId: userStory._id}).forEach(function (sticky) {
                Stickies.remove({_id: sticky._id});
            });
            UserStories.remove({_id: userStory._id});
        });
        Sprints.remove({_id: this.data._id});
        Meteor.call('updateBurndown', product._id, function (err) {
            if (err) {
                throwAlert("error", "Error!", err);
            }
        });
        Meteor.call('createActElSprintRemoved', product._id, Meteor.user()._id, sprintGoal, function (err) {
            if (err) {
                throwAlert("error", "Error!", err);
            }
        });
        Dialogs.remove(this._id);
        throwAlert('success', 'Yeah!', 'Sprint removed.');
    },
    'click .delete-comment-confirm': function() {
        Comments.remove(this.data._id);
        Dialogs.remove(this._id);
        throwAlert('success', 'Yeah!', 'Comment removed.');
    }
});