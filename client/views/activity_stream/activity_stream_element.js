"use strict";

Template.activityStreamElement.helpers({
    elType: function (type) {
        return this.type === parseInt(type, 10);
    },
    user: function () {
        return Users.findOne({_id: this.userId});
    },
    sprintStartDate: function () {
        return moment.utc(this.sprintStartDate).format('YYYY-MM-DD');
    },
    sprintEndDate: function () {
        return moment.utc(this.sprintEndDate).format('YYYY-MM-DD');
    },
    stickyStatusFormatted: function (type) {
        var status = 0;
        if (type === "old") {
            status = this.oldStickyStatus;
        } else if (type === "new") {
            status = this.newStickyStatus;
        }
        if (status == "1") {
            return "ToDo";
        } else if (status == "2") {
            return "Started";
        } else if (status == "3") {
            return "Verify";
        } else if (status == "4") {
            return "Done";
        }
    },
    author: function () {
        var user = Users.findOne({_id: this.userId});
        return (Meteor.user().username === user.username) ? "You" : user.username;
    },
    comments: function () {
        return Comments.find({actElId: this._id});
    }
});

Template.activityStreamElement.events({
    'click .add-comment': function () {
        Session.set('actElId', Template.currentData()._id);
    }
});

Template.activityStreamElement.onDestroyed(function () {
    Session.set('actElId', null);
});