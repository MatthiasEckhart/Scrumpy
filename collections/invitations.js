Invitations = new Meteor.Collection('invitations');

Invitations.allow({
    insert: allowPermission,
    update: allowPermission,
    remove: allowPermission
});