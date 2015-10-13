"use strict";

Template.sticky.onRendered(function () {
    var assignStickyToEditableSelector = this.$("#assign-sticky-to-" + this.data._id),
        stickyTitleEditableSelector = this.$("#editable-sticky-title-" + this.data._id),
        stickyDescriptionEditableSelector = this.$("#editable-sticky-description-" + this.data._id),
        stickyEffortEditableSelector = this.$("#editable-sticky-effort-" + this.data._id),
        showInfoStickyPopoverSelector = this.$("#show-info-sticky-" + this.data._id),
        sticky = this.data,
        stickyId = sticky._id,
        story = UserStories.findOne({_id: Template.parentData(1)._id}),
        advancedMode = Products.findOne({_id: story.productId}).advancedMode,
        sprint,
        rd;
    if (advancedMode) {
        sprint = Sprints.findOne({_id: story.sprintId});
    }

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
                lastMoved: Meteor.user().username
            }
        });
        Meteor.call('createActElStickyMoved', stickyDroppedUserStory.productId, Meteor.user()._id, stickyDropped.title, stickyOldStatus, stickyDropped.status, function (error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
        });
    };

    stickyTitleEditableSelector.editable("destroy").editable({
        display: false,
        placement: 'bottom',
        title: "Update sticky title",
        pk: sticky._id,
        validate: function (value) {
            if ($.trim(value) === '') {
                return 'Please fill in a title.';
            }
        },
        success: function (response, newValue) {
            if (newValue) {
                var oldStickyTitle = sticky.title;
                Stickies.update({_id: stickyId}, {$set: {title: newValue, lastEdited: Meteor.user().username}});
                throwAlert('success', 'Yes!', 'Sticky title edited.');
                if (advancedMode) {
                    Meteor.call('createActElStickyEditTitle', story.productId, Meteor.user()._id, oldStickyTitle, newValue, function (error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                    });
                }
            }
        }
    });
    stickyDescriptionEditableSelector.editable("destroy").editable({
        display: false,
        placement: 'bottom',
        title: "Update sticky description",
        pk: sticky._id,
        validate: function (value) {
            if ($.trim(value) == '') {
                return 'Please fill in a description.';
            }
        },
        success: function (response, newValue) {
            if (newValue) {
                var oldStickyDescription = sticky.description;
                Stickies.update({_id: stickyId}, {$set: {description: newValue, lastEdited: Meteor.user().username}});
                throwAlert('success', 'Yes!', 'Sticky description edited.');
                if (advancedMode) {
                    Meteor.call('createActElStickyEditDescription', story.productId, Meteor.user()._id, oldStickyDescription, newValue, function (error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                    });
                }
            }
        }
    });

    var stickyEffortArr = [{value: 2, text: 2}, {value: 4, text: 4}, {value: 6, text: 6}, {value: 8, text: 8}];

    stickyEffortEditableSelector.editable("destroy").editable({
        title: "Update estimated sticky effort (h)",
        placement: 'bottom',
        source: stickyEffortArr,
        pk: sticky._id,
        success: function (response, newValue) {
            if (newValue) {
                var oldValue = sticky.effort;
                Stickies.update({_id: stickyId}, {
                    $set: {
                        effort: parseInt(newValue, 10),
                        lastEdited: Meteor.user().username
                    }
                });
                throwAlert('success', 'Yes!', 'Estimated effort updated.');
                if (advancedMode) {
                    Meteor.call('createActElStickyEffortChanged', story.productId, Meteor.user()._id, oldValue, newValue, sticky.title, function (error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                    });
                    Meteor.call('updateBurndown', sprint._id, function (error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                        }
                    });
                }
            }
        }
    });

    var sourceUsers = [];
    if (!Template.parentData(3).advancedMode) {
        Roles.getUsersInRole([this.data.productId], 'administrator').forEach(function (user) {
            sourceUsers.push({value: user._id, text: user.username});
        });
    } else {
        Roles.getUsersInRole([this.data.productId], 'productOwner').forEach(function (user) {
            sourceUsers.push({value: user._id, text: user.username});
        });
        Roles.getUsersInRole([this.data.productId], 'scrumMaster').forEach(function (user) {
            sourceUsers.push({value: user._id, text: user.username});
        });
    }
    Roles.getUsersInRole([this.data.productId], 'developmentTeam').forEach(function (user) {
        sourceUsers.push({value: user._id, text: user.username});
    });

    assignStickyToEditableSelector.editable("destroy").editable({
        emptytext: "nobody",
        placement: 'bottom',
        title: "Assign sticky to",
        source: sourceUsers,
        pk: sticky._id,
        success: function (response, result) {
            if (result) {
                Stickies.update({_id: stickyId}, {$set: {assigneeId: result}});
                throwAlert("success", "Yes!", "Sticky successfully assigned.");
            }
        }
    });

    setAssignStickyToCurrValue(this.data, assignStickyToEditableSelector);

    var cursor = Stickies.find({_id: this.data._id});
    cursor.observe({
        changed: function (sticky) {
            stickyTitleEditableSelector.editable("setValue", sticky.title);
            stickyDescriptionEditableSelector.editable("setValue", sticky.description);
            stickyEffortEditableSelector.editable("setValue", sticky.effort);
            setAssignStickyToCurrValue(sticky, assignStickyToEditableSelector);
        }
    });

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
        if (this.assigneeId === Meteor.user()._id) {
            return Meteor.user();
        } else {
            var user = Users.findOne({_id: this.assigneeId});
            if (user) {
                return user;
            }
        }
    },
    assigneeColor: function () {
        var user = Users.findOne({_id: this.assigneeId});
        if (user) {
            return user.profile.color;
        }
    },
    advancedMode: function () {
        return Template.parentData(3).advancedMode;
    }
});

function updateStickyPosition(stickyId, location) {
    Stickies.update({_id: stickyId}, {$set: {status: parseInt(location, 10), lastMoved: Meteor.user().username}});
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

function setAssignStickyToCurrValue(data, selector) {
    if (data.assigneeId) {
        selector.editable("setValue", data.assigneeId);
    }
}