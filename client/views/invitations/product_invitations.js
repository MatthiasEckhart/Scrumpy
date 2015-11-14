"use strict";

Template.productInvitations.helpers({
    invitations: function () {
        return Invitations.find({productId: this._id}, {sort: {status: 1}});
    },
    user: function () {
        return Users.findOne({_id: this.userId});
    },
    roleFormatted: function () {
        return this.role == 2 ? "Scrum Master" : "Development Team member";
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

Template.productInvitations.events({
    'click .decline-invitation': function () {
        if (this.status == 0 || this.status == 1) {
            Meteor.call('removeUserFromRole', this.productId, this.userId, this.role, (error) => {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return;
                }
                Invitations.update({_id: this._id}, {$set: {status: 2}});
            });
        }
    }
});

Template.productInvitations.onRendered(function () {
    Session.set('activeNavTab', 'productInvitations');
});