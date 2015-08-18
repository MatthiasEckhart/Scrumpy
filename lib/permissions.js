// check that the userId specified owns the documents
ownsDocument = function (userId, doc) {
    return doc && doc.userId === userId;
};

ownsDocumentOrAdmin = function (userId, doc) {
    return (doc && doc.userId === userId) || Roles.userIsInRole(userId, doc.productId + '-admin');
};

productAdminOrMember = function (userId, doc) {
    return Roles.userIsInRole(userId, doc.productId + '-admin') || Roles.userIsInRole(userId, doc.productId + '-member');
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