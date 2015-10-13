"use strict";

Comments.before.insert(function (userId, doc) {
    updateLastModifiedForProduct(doc.productId);
});

Comments.before.update(function (userId, doc, fieldNames, modifier, options) {
    updateLastModifiedForProduct(doc.productId);
});

Comments.before.remove(function (userId, doc) {
    updateLastModifiedForProduct(doc.productId);
});