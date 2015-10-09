ActivityStreamElements = new Mongo.Collection('activityStreamElements');

ActivityStreamElements.deny({
    insert: denyPermission,
    update: denyPermission,
    remove: denyPermission
});