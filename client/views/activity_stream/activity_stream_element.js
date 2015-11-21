"use strict";

Template.activityStreamElement.helpers({
    elType: function (type) {
        return this.type === parseInt(type, 10);
    },
    user: function () {
        return Users.findOne({_id: this.userId});
    },
    formattedSprintDate: function (date) {
        return moment.utc(this[date]).format('YYYY-MM-DD');
    },
    formattedStoryPoints: function (storyPoints) {
        return this[storyPoints] === 0.5 ? "½" : this[storyPoints];
    },
    stickyStatusFormatted: function (type) {
        var status = 0;
        if (type === "old") {
            status = this.oldStickyStatus;
        } else if (type === "new") {
            status = this.newStickyStatus;
        }
        if (status == "1") return "ToDo";
        else if (status == "2") return "Started";
        else if (status == "3") return "Verify";
        else if (status == "4") return "Done";
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