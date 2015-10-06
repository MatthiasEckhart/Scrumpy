"use strict";

Template.conversationItem.helpers({
    recipients: function () {
        let recipients = this.recipients;
        recipients.push(this.userId);
        return Users.find({_id: {$in: recipients, $ne: Meteor.userId()}});
    },
    user: function () {
        return Users.findOne({username: this.username});
    },
    removeOrLeaveConversation: function () {
        if (this.userId == Meteor.userId()) return "remove-pm";
        else return "leave-pm";
    },
    noRecipients: function () {
        return Users.find({_id: {$in: this.recipients, $ne: Meteor.userId()}}).count() == 0;
    },
    userIsAuthor: function () {
        return this.userId == Meteor.userId();
    }
});

Template.conversationItem.events({
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