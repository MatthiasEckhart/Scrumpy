Sprints = new Meteor.Collection('sprints');

Sprints.allow({
    insert: isScrumMaster,
    update: isScrumMaster,
    remove: isScrumMaster
});

Sprints.before.insert(function (userId, doc) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});

Sprints.before.update(function (userId, doc, fieldNames, modifier, options) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});

Sprints.before.remove(function (userId, doc) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});