Template.invite.helpers({
    userInvitationFormSchema: function () {
        return Schema.invitationUser;
    }
});

Template.invite.events({
    'click #invite': function () {
        /* Only submit ScrumMaster invitation form, if we handle an advanced product. */
        if (this.advancedMode) $('#insert-scrum-master-invitations-form').submit();
        $('#insert-development-team-invitations-form').submit();
    }
});