Documents = new Mongo.Collection('documents');

Documents.allow({
    insert: scrumTeam,
    update: scrumTeam,
    remove: scrumTeam
});

Meteor.methods({
    deleteDocument: function (id) {
        if (Meteor.isServer) {
            Documents.remove(id);
            if (!this.isSimulation) {
                return ShareJS.model["delete"](id);
            }
        }
    }
});

Documents.before.insert(function (userId, doc) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});

Documents.before.update(function (userId, doc, fieldNames, modifier, options) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});

Documents.before.remove(function (userId, doc) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});