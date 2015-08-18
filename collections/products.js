Products = new Meteor.Collection('products');

Products.allow({
    insert: ownsDocument,
    update: ownsDocument,
    remove: ownsDocument
});

Products.before.insert(function (userId, doc) {
    var dashboardStats = DashboardStatistics.findOne();
    DashboardStatistics.update({_id: dashboardStats._id}, {$inc: {totalProducts: 1}});
});

Products.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.lastModified = new Date();
});

Products.before.remove(function (userId, doc) {
    var dashboardStats = DashboardStatistics.findOne();
    DashboardStatistics.update({_id: dashboardStats._id}, {$inc: {totalProducts: -1}});
});

Meteor.methods({
    createProduct: function (productAttributes) {
        if (Meteor.isServer) {
            var user = Meteor.user(),
                counterDoc,
                firstInsert,
                cId,
                counterVar,
                product,
                productId;

            // ensure the user is logged in
            if (!user) {
                throw new Meteor.Error(401, "You need to login to create a new product", "Please log in");
            }
            // ensure the product has a title
            if (!productAttributes.title) {
                throw new Meteor.Error(422, "Please fill in a title", "Title is empty");
            }
            // ensure the product has a vision
            if (productAttributes.advancedMode && !productAttributes.vision) {
                throw new Meteor.Error(422, "Please fill in a vision", "Vision is empty");
            }

            // check if collection is empty
            counterDoc = Counter.findOne();
            firstInsert = false;
            // if counter collection is empty, insert first document
            if (!counterDoc) {
                cId = Counter.insert({'productCounterForUniqueURLs': 0});
                firstInsert = true;
                counterDoc = Counter.findOne({_id: cId});
            }
            // if collection is not empty, update product counter for unique URLs
            if (!firstInsert && counterDoc) {
                Counter.update({_id: counterDoc._id}, {$inc: {'productCounterForUniqueURLs': 1}});
            }
            counterVar = Counter.findOne().productCounterForUniqueURLs;

            // pick out the whitelisted keys and build product object
            product = _.extend(_.pick(productAttributes, 'title', 'vision', 'advancedMode'), {
                userId: user._id,
                author: user.username,
                submitted: new Date(),
                lastModified: new Date(),
                slug: counterVar + '-' + slugify(productAttributes.title)
            });
            productId = Products.insert(product);
            DashboardStatisticsPrivate.insert({productId: productId, data: []});
            return Products.findOne({_id: productId});
        }
    },
    updateProduct: function (productAttributes, productId) {
        if (Meteor.isServer) {
            var user = Meteor.user();

            // ensure the user is logged in
            if (!user) {
                throw new Meteor.Error(401, "You need to login to create a new product", "Please log in");
            }
            // ensure the product has a title
            if (!productAttributes.title) {
                throw new Meteor.Error(422, "Please fill in a title", "Title is empty");
            }
            // ensure the product has a vision
            if (productAttributes.advancedMode && !productAttributes.vision) {
                throw new Meteor.Error(422, "Please fill in a vision", "Vision is empty");
            }
            Products.update(productId, {$set: productAttributes});
            return Products.findOne({_id: productId});
        }
    },
    deleteProduct: function (productId) {
        if (Meteor.isServer) {
            var product = Products.findOne({_id: productId}),
                usernames = [],
                documentIds,
                db,
                pm,
                devTeamInv,
                scrumMasterInv;
            Products.remove(productId);

            if (product.advancedMode) {
                // remove Product Owner and Scrum Master from role
                Roles.getUsersInRole([productId], 'productOwner').forEach(function (user) {
                    Roles.removeUsersFromRoles(user, [productId], 'productOwner');
                    usernames.push(user.username);
                });
                Roles.getUsersInRole([productId], 'scrumMaster').forEach(function (user) {
                    Roles.removeUsersFromRoles(user, [productId], 'scrumMaster');
                    usernames.push(user.username);
                });
                Burndown.remove({productId: productId});
                Comments.remove({productId: productId});
                ActivityStreamElements.remove({productId: productId});
                documentIds = Documents.find({productId: productId}).map(function (doc) {
                    return doc._id;
                });
                if (documentIds.length > 0) {
                    db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;
                    db.collection("docs").remove({_id: {$in: documentIds}}, {w: 0}); // write-concern value of 0
                    db.collection("ops").remove({"_id.doc": {$in: documentIds}}, {w: 0}); // write-concern value of 0
                }
                Documents.remove({productId: productId});
                Sprints.remove({productId: productId});
            } else {
                // remove administrator from role
                Roles.getUsersInRole([productId], 'administrator').forEach(function (user) {
                    Roles.removeUsersFromRoles(user, [productId], 'administrator');
                    usernames.push(user.username);
                });
            }
            // remove all members from development team from role
            Roles.getUsersInRole([productId], 'developmentTeam').forEach(function (user) {
                Roles.removeUsersFromRoles(user, [productId], 'developmentTeam');
                usernames.push(user.username);
            });
            // remove role
            if (Roles.getUsersInRole([productId]).count() === 0) {
                Roles.deleteRole(productId);
            }

            UserStories.remove({productId: productId});
            Stickies.remove({productId: productId});

            pm = PrivateMessages.findOne({productId: productId});
            devTeamInv = [];
            scrumMasterInv = [];
            // check private message, if there are invitations to remove
            _.each(pm.messages, function (m) {
                if (_.has(m, "invitations")) {
                    if (_.has(m.invitations, "developmentTeam")) {
                        Invitations.find({_id: {$in: m.invitations.developmentTeam}}).forEach(function (inv) {
                            devTeamInv.push(inv);
                        });
                    }
                    if (_.has(m.invitations, "scrumMaster")) {
                        Invitations.find({_id: m.invitations.scrumMaster}).forEach(function (inv) {
                            scrumMasterInv.push(inv);
                        });
                    }
                }
            });
            // remove invitations
            if (devTeamInv.length > 0) {
                _.each(devTeamInv, function (u) {
                    usernames.push(u.username);
                    Invitations.remove({_id: u._id});
                });
            }
            if (scrumMasterInv.length > 0) {
                _.each(scrumMasterInv, function (u) {
                    usernames.push(u.username);
                    Invitations.remove({_id: u._id});
                });
            }
            // remove private messages from users
            Users.update({username: {$in: usernames}}, {$pull: {privateMessages: pm._id}}, {multi: true});
            PrivateMessages.remove({productId: productId});
        }
    }
});

// function to slugify Strings on the server
slugify = function (title) {
    return title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};