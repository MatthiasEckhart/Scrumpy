Users = Meteor.users;

Users.deny({
    insert: denyPermission,
    update: denyPermission,
    remove: denyPermission
});