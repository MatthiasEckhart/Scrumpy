"use strict";

Stickies.before.insert(function (userId, doc) {
    updateLastModifiedForProduct(doc.productId);
});

Stickies.before.update(function (userId, doc, fieldNames, modifier, options) {
    updateLastModifiedForProduct(doc.productId);
});

Stickies.after.update(function (userId, doc, fieldNames, modifier, options) {
    if (fieldNames[0] === "effort") updateLastModifiedForProduct(doc.productId);
}, {fetchPrevious: true});

Stickies.before.remove(function (userId, doc) {
    updateLastModifiedForProduct(doc.productId);
});