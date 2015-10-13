"use strict";

Meteor.methods({
    deleteDocument: function (id) {
        Documents.remove(id);
        if (!this.isSimulation) {
            return ShareJS.model["delete"](id);
        }
    }
});

Documents.before.insert(function (userId, doc) {
    updateLastModifiedForProduct(doc.productId);
});

Documents.before.update(function (userId, doc, fieldNames, modifier, options) {
    updateLastModifiedForProduct(doc.productId);
});

Documents.before.remove(function (userId, doc) {
    updateLastModifiedForProduct(doc.productId);
});