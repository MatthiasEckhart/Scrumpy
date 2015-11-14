"use strict";

Template.invitations.helpers({
    invitations: function () {
        return Invitations.find({}, {sort: {status: 1, updatedAt: -1}});
    },
    statusFormatted: function () {
        if (this.status == 0) return "pending";
        else if (this.status == 1) return "accepted";
        else return "declined";
    },
    statusCss: function () {
        if (this.status == 0) return "label-default";
        else if (this.status == 1) return "label-success";
        else return "label-danger";
    }
});