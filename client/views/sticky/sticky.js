"use strict";

Template.sticky.onRendered(function () {
    var showInfoStickyPopoverSelector = this.$("#show-info-sticky-" + this.data._id),
        sticky = this.data,
        stickyId = sticky._id,
        story = UserStories.findOne({_id: Template.parentData(1)._id}),
        advancedMode = Products.findOne({_id: story.productId}).advancedMode,
        sprint,
        rd;
    if (advancedMode) sprint = Sprints.findOne({_id: story.sprintId});

    REDIPS.drag.init();
    REDIPS.drag.hover.colorTd = '#9BB3DA';

    // reference to the REDIPS.drag library
    rd = REDIPS.drag;
    // define event.dropped handler
    rd.event.dropped = function () {
        var pos = rd.getPosition(),
            stickyDroppedId = rd.obj.getAttribute('id'),
            stickyDropped = Stickies.findOne({_id: stickyDroppedId}),
            stickyOldStatus = stickyDropped.status,
            stickyDroppedUserStory = UserStories.findOne({_id: stickyDropped.storyId});

        if (pos[2] === 2) {
            updateStickyPosition(stickyDroppedId, "1");
        } else if (pos[2] === 3) {
            updateStickyPosition(stickyDroppedId, "2");
        } else if (pos[2] === 4) {
            updateStickyPosition(stickyDroppedId, "3");
        } else if (pos[2] === 5) {
            updateStickyPosition(stickyDroppedId, "4");
            if (advancedMode) {
                Meteor.call('updateBurndown', sprint._id, function (err) {
                    if (err) {
                        alert(err);
                    }
                });
            }
            Meteor.call('updateDashboardStatisticsPrivateInc', stickyDropped, function (err) {
                if (err) {
                    alert(err);
                }
            });
        }
        if (pos[2] !== 5) {
            Meteor.call('updateDashboardStatisticsPrivateDec', stickyDropped, function (err) {
                if (err) {
                    alert(err);
                }
            });
            if (advancedMode) {
                checkMovementBackFromDone(rd, sprint._id);
            }
        }

        Stickies.update({_id: stickyDroppedId}, {
            $set: {
                storyId: stickyDroppedUserStory._id,
                lastMovedBy: Meteor.userId()
            }
        });

        Meteor.call('createActElStickyMoved', stickyDroppedUserStory.productId, Meteor.user()._id, stickyDropped.title, stickyOldStatus, stickyDropped.status, function (error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
        });
    };

    showInfoStickyPopoverSelector.popover({
        html: true,
        title: 'Details',
        content: function () {
            return $("#popover-content-" + stickyId).html();
        }
    });
});

Template.sticky.events({
    'click .delete-sticky': function (e) {
        e.preventDefault();
        throwDialog('warning', 'Wait!', 'Are you sure you want delete the sticky ' + this.title + '?', 'Sure, delete it', 'No, do not delete', 'delete-sticky-confirm', this);
    },
    'click .show-info-sticky': function (e) {
        e.preventDefault();
    }
});

Template.sticky.helpers({
    user: function () {
        if (this.assigneeId === Meteor.user()._id) return Meteor.user();
        else {
            var user = Users.findOne({_id: this.assigneeId});
            if (user) return user;
        }
    },
    assigneeColor: function () {
        var user = Users.findOne({_id: this.assigneeId});
        if (user) return user.profile.color;
    },
    advancedMode: function () {
        return Template.parentData(3).advancedMode;
    },
    userIdFormatted: function () {
        return getUsername(this.userId);
    },
    lastMovedByFormatted: function () {
        return getUsername(this.lastMovedBy);
    },
    lastEditedByFormatted: function () {
        return getUsername(this.lastEditedBy);
    },
    assigneeIdFormatted: function () {
        return getUsername(this.assigneeId);
    }
});

function updateStickyPosition(stickyId, location) {
    Stickies.update({_id: stickyId}, {$set: {status: parseInt(location, 10), lastMovedBy: Meteor.userId()}});
}

function checkMovementBackFromDone(rd, sprintId) {
    if (rd.td.source.className === "done") {
        Meteor.call('updateBurndown', sprintId, function (err) {
            if (err) {
                alert(err);
            }
        });
    }
}