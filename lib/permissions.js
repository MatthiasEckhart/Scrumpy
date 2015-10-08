// check that the userId specified owns the documents
ownsDocument = function (userId, doc) {
    return doc && doc.userId === userId;
};

ownsProduct = function (userId, doc) {
    let product = Products.findOne({_id: doc.productId});
    return (doc && product && userId === product.userId);
};

ownsDocumentOrAdminOrProductOwner = function (userId, doc) {
    return (doc && doc.userId === userId) || Roles.userIsInRole(userId, [doc.productId], 'administrator') || Roles.userIsInRole(userId, [doc.productId], 'productOwner');
};

ownsDocumentOrProductOwner = function (userId, doc) {
    return (doc && doc.userId === userId) || Roles.userIsInRole(userId, [doc.productId], 'productOwner');
};

isProductOwner = function (userId, doc) {
    return Roles.userIsInRole(userId, [doc.productId], 'productOwner');
};

scrumTeam = function (userId, doc) {
    var scrumTeamIntersectArr = _.intersection(Roles.getGroupsForUser(userId, doc.productId), ['administrator', 'developmentTeam', 'productOwner', 'scrumMaster', 'developmentTeam']);
    return scrumTeamIntersectArr.length !== 0;
};

isScrumMaster = function (userId, doc) {
    return Roles.userIsInRole(userId, [doc.productId], 'scrumMaster');
};

// deny permission
denyPermission = function () {
    return true;
};

allowPermission = function () {
    return true;
};