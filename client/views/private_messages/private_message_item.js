"use strict";

Template.privateMessageItem.helpers({
    participants: function () {
        return Users.find({_id: {$in: this.participants, $ne: Meteor.userId()}});
    },
    user: function () {
        return Users.findOne({username: this.username});
    },
    removeOrLeavePrivateMessage: function () {
        if (this.author == Meteor.user().username) {
            return "remove-pm";
        } else {
            return "leave-pm";
        }
    },
    noParticipants: function () {
        return Users.find({_id: {$in: this.participants, $ne: Meteor.userId()}}).count() == 0;
    },
    userIsAuthor: function () {
        return this.author == Meteor.user().username;
    }
});

Template.privateMessageItem.events({
    'click .remove-pm': function (e) {
        e.preventDefault();
        Meteor.call('removePrivateMessage', this._id, function (error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
        });
    },
    'click .leave-pm': function (e) {
        e.preventDefault();
        Meteor.call('leavePrivateMessage', this._id, Meteor.userId(), function (error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
        });
    }
});