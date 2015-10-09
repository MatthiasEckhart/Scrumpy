UserStories = new Mongo.Collection('userStories');

UserStories.allow({
    insert: scrumTeam,
    update: scrumTeam,
    remove: scrumTeam
});

UserStories.before.insert(function (userId, doc) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});

UserStories.before.update(function (userId, doc, fieldNames, modifier, options) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});

UserStories.before.remove(function (userId, doc) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});