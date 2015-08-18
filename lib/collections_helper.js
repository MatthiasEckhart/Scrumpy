updateLastModifiedForProduct = function (productId) {
    Products.update({_id: productId}, {$set: {lastModified: new Date()}});
};