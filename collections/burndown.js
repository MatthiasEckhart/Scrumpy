Burndown = new Mongo.Collection('burndown');

Burndown.allow({
    insert: allowPermission,
    update: allowPermission,
    remove: allowPermission
});