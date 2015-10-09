"use strict";

UserStories.before.insert(function (userId, doc) {
    updateLastModifiedForProduct(doc.productId);
});

UserStories.before.update(function (userId, doc, fieldNames, modifier, options) {
    updateLastModifiedForProduct(doc.productId);
});

UserStories.before.remove(function (userId, doc) {
    updateLastModifiedForProduct(doc.productId);
});