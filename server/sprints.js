"use strict";

Sprints.before.insert(function (userId, doc) {
    updateLastModifiedForProduct(doc.productId);
});

Sprints.before.update(function (userId, doc, fieldNames, modifier, options) {
    updateLastModifiedForProduct(doc.productId);
});

Sprints.before.remove(function (userId, doc) {
    updateLastModifiedForProduct(doc.productId);
});