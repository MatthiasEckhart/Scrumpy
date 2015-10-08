"use strict";

Template.invite.helpers({
    userInvitationFormSchema: function () {
        return Schema.invitationUser;
    },
    textForCancelButton: function () {
        if (Session.equals('productCreate', true)) return "Skip";
        else return "Cancel";
    },
    productCreateSession: function () {
        return Session.equals('productCreate', true);
    },
    invitations: function () {
        return Invitations.find({productId: this._id}, {sort: {status: 1}});
    },
    user: function () {
        return Users.findOne({_id: this.userId});
    },
    roleFormatted: function () {
        return this.role == 2 ? "Scrum Master" : "Development Team member";
    },
    createdAtFormatted: function () {
        return moment(this.createdAt).format("MMMM Do YYYY, h:mm:ss a");
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

Template.invite.events({
    'click #invite': function () {
        /* Only submit ScrumMaster invitation form, if we handle an advanced product. */
        if (this.advancedMode) $('#insert-scrum-master-invitations-form').submit();
        $('#insert-development-team-invitations-form').submit();
    },
    'click #skip': function () {
        if (this.advancedMode) Router.go('productDashboard', {slug: this.slug});
        else Router.go('taskBoardPage', {slug: this.slug});
    },
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

Template.invite.onDestroyed(function () {
    /* Remove session when user changes the route. */
    Session.set('productCreate', null);
});