"use strict";

Template.conversation.helpers({
    privateMessages: function() {
        return PrivateMessages.find({conversationId: this._id});
    },
    removeOrLeaveConversation: function () {
        if (this.userId == Meteor.userId()) return "remove-pm";
        else return "leave-pm";
    },
    userIsAuthor: function () {
        return this.userId == Meteor.userId();
    }
});

Template.conversation.events({
    'click .remove-pm': function (e) {
        e.preventDefault();
        Meteor.call('removePrivateMessage', this._id, function (error) {
            if (error) throwAlert('error', error.reason, error.details);
            Router.go("dashboard");
        });
    },
    'click .leave-pm': function (e) {
        e.preventDefault();
        Meteor.call('leavePrivateMessage', this._id, Meteor.userId(), function (error) {
            if (error) throwAlert('error', error.reason, error.details);
            Router.go("dashboard");
        });
    }
});