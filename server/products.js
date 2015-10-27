Meteor.methods({
    getProductSlug: function (productId) {
        let product = Products.findOne({_id: productId});
        if (product) return product.slug;
        else throw new Meteor.Error(500, "Product not found.", "Please contact support team.");
    },
    deleteProduct: function (data) {
        var {productId, userId} = data,
            product = getDocument(Products, productId),
            documentIds,
            db;

        /* Do a server-side check. */
        if (product.userId != userId) throw new Meteor.Error(500, "Insufficient permissions.", "You are not allowed to delete this product");

        if (product.advancedMode) {
            /* Remove Product Owner and Scrum Master from role. */
            Roles.getUsersInRole([productId], 'productOwner').forEach(function (user) {
                Roles.removeUsersFromRoles(user, [productId], 'productOwner');
            });
            Roles.getUsersInRole([productId], 'scrumMaster').forEach(function (user) {
                Roles.removeUsersFromRoles(user, [productId], 'scrumMaster');
            });

            /* Remove data which is specific for advanced products. */
            Burndown.remove({productId: productId});
            Comments.remove({productId: productId});
            ActivityStreamElements.remove({productId: productId});
            Sprints.remove({productId: productId});

            /* Get all document IDs which correspond to this product. */
            documentIds = Documents.find({productId: productId}).map(function (doc) {
                return doc._id;
            });
            /* Remove corresponding documents. */
            if (documentIds.length > 0) {
                db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;
                db.collection("docs").remove({_id: {$in: documentIds}}, {w: 0}); // write-concern value of 0
                db.collection("ops").remove({"_id.doc": {$in: documentIds}}, {w: 0}); // write-concern value of 0
            }
            Documents.remove({productId: productId});
        } else {
            /* Remove administrator from role. */
            Roles.getUsersInRole([productId], 'administrator').forEach(function (user) {
                Roles.removeUsersFromRoles(user, [productId], 'administrator');
            });
        }
        /* Remove all members from development team from role. */
        Roles.getUsersInRole([productId], 'developmentTeam').forEach(function (user) {
            Roles.removeUsersFromRoles(user, [productId], 'developmentTeam');
        });
        /* Remove role. */
        if (Roles.getUsersInRole([productId]).count() === 0) {
            Roles.deleteRole(productId);
        }
        /* Remove various documents which may exists for advanced and regular products. */
        UserStories.remove({productId: productId});
        Stickies.remove({productId: productId});
        Invitations.remove({productId: productId});
        Products.remove(productId);
    }
});