Notifications = new Meteor.Collection('notifications');

Notifications.allow({
    insert: ownsDocument,
    remove: allowPermission
});

Notifications.deny({
    update: denyPermission
});