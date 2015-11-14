"use strict";

Template.invite.helpers({
    userInvitationFormSchema: function () {
        return Schema.invitationUser;
    },
    textForCancelButton: function () {
        if (Session.equals('productCreate', true)) return "Skip";
        else return "Cancel";
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
    }
});

Template.invite.onDestroyed(function () {
    /* Remove session when user changes the route. */
    Session.set('productCreate', null);
});

Template.invite.onRendered(function () {
    Session.set('activeNavTab', 'invite');
});