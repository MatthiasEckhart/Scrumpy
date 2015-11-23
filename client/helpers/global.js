/* Register underscore helper. */
Template.registerHelper('_', function () {
    return _;
});

Template.registerHelper('userByProductId', function () {
    let product = Products.findOne({_id: this.productId});
    if (product) return Users.findOne({_id: product.userId});
});

Template.registerHelper('roleFormatted', function () {
    return this.role == 2 ? "Scrum Master" : "Development Team member";
});

Template.registerHelper('productTitle', function (value) {
    let product = Products.findOne({_id: this[value]});
    if (product) return product.title;
    else return UNKNOWN;
});

Template.registerHelper('titleShort', function (type) {
    var short = this.title;
    if (short) {
        if (type === "product") {
            if (short.length > 20) {
                short = short.substring(0, 20) + '...';
            }
        } else if (type === "sticky" || type === "story") {
            if (short.length > 50) {
                short = short.substring(0, 50) + '...';
            }
        }
    }
    return short;
});

Template.registerHelper('representative', function () {
    if (this._id) {
        let product = Products.findOne({_id: this._id});
        if (product) return product.advancedMode ? 'Product Owner' : 'Administrator';
    } else return ANONYMOUS;
});

Template.registerHelper('currentUserUsername', function () {
    return Meteor.user().username;
});

Template.registerHelper('navTabIsActive', function (navTab) {
    return Session.equals('activeNavTab', navTab);
});

Template.registerHelper('advancedMode', function (formId) {
    if (_.has(this, "advancedMode")) return this.advancedMode;
    else return AutoForm.getFieldValue('advancedMode', formId);
});

Template.registerHelper('totalDevTeamMember', function () {
    return Invitations.find({
        productId: this._id,
        role: 3,
        status: {$ne: 2}
    }, {$and: [{status: 0}, {status: 1}]}).count();
});

Template.registerHelper('totalScrumMaster', function () {
    return Invitations.find({
        productId: this._id,
        role: 2,
        status: {$ne: 2}
    }, {$and: [{status: 0}, {status: 1}]}).count();
});

Template.registerHelper('teamOverview', function (role) {
    return Invitations.find({
        productId: this._id,
        role: parseInt(role, 10),
        status: {$ne: 2}
    }).map(function (document, index) {
        document.isAlreadyInRole = document.status == 1;
        let user = Users.findOne({_id: document.userId});
        if (user) document.username = user.username;
        else document.username = ANONYMOUS;
        document.index = index + 1;
        return document;
    });
});

Template.registerHelper('isOnline', function () {
    if (_.has(this, 'profile') && _.has(this.profile, 'online')) {
        return this.profile.online;
    } else {
        var user = Users.findOne({username: this.username});
        if (user && _.has(user, 'profile') && _.has(user.profile, 'online')) {
            return user.profile.online;
        }
    }
});

Template.registerHelper('avatar', function () {
    if (_.has(this, 'profile') && _.has(this.profile, 'image')) return this.profile.image;
    else return DEFAULT_AVATAR;
});

Template.registerHelper('fullNameOrUsername', function (displayUsername) {
    if (_.has(this, 'profile') && _.has(this.profile, 'firstName') && _.has(this.profile, 'lastName') && this.profile.firstName && this.profile.lastName) return this.profile.firstName + " " + this.profile.lastName;
    else if (displayUsername == "true") return this.username;
    else return ANONYMOUS;
});

Template.registerHelper('userIsScrumMaster', function (template) {
    if (template === "sprint") {
        return Roles.userIsInRole(Meteor.user(), [Template.parentData(2)._id], 'scrumMaster');
    } else if (template === "sprintPlanning") {
        return Roles.userIsInRole(Meteor.user(), [this._id], 'scrumMaster');
    }
});

Template.registerHelper('sprintStartDateFormatted', function () {
    return moment.utc(this.startDate).format('YYYY-MM-DD');
});

Template.registerHelper('sprintEndDateFormatted', function () {
    return moment.utc(this.endDate).format('YYYY-MM-DD');
});

Template.registerHelper('fromNow', function (value) {
    return moment(this[value]).fromNow();
});


Template.registerHelper('fullName', function () {
    if (_.has(this, 'profile') && _.has(this.profile, 'firstName') && _.has(this.profile, 'lastName')) return this.profile.firstName + " " + this.profile.lastName;
    else return "";
});

Template.registerHelper('noInvitations', function () {
    return Invitations.find({'productId': this._id}).count() == 0;
});

Template.registerHelper('userIsProductOwner', function (template) {
    let productId;
    if (template === "userStory") productId = this.productId;
    else productId = this._id;
    return Roles.userIsInRole(Meteor.user(), [productId], 'productOwner');
});

Template.registerHelper('authorByUserId', function () {
    var user = Users.findOne({_id: this.userId});
    return (Meteor.user().username === user.username) ? "You" : user.username;
});

Template.registerHelper('userIsProductOwnerOrAdmin', function (template) {
    let productId;
    if (template === "userStory") productId = this.productId;
    else productId = this._id;
    return Roles.userIsInRole(Meteor.user(), [productId], 'productOwner') || Roles.userIsInRole(Meteor.user(), [productId], 'administrator');
});

setSessionForActiveNavTab = function (name) {
    Session.set('activeNavTab', name);
};

/* Returns slug from router parameters. */
getRouteSlug = function () {
    return Router.current().params.slug;
};

productIsAdvancedModeStartDateEndDate = function (advancedMode) {
    return advancedMode && Router.current().params.startDate && Router.current().params.endDate;
};

getSprintId = function (productId, routerStartDate, routerEndDate) {
    if (productId && routerStartDate && routerEndDate) {
        var sprint = Sprints.findOne({productId: productId, startDate: routerStartDate, endDate: routerEndDate});
        if (sprint) return sprint._id;
    }
};

getUsername = function (userId) {
    let user = Users.findOne({_id: userId});
    if (user) return user.username;
    else return ANONYMOUS;
};

signOut = function () {
    let username = Meteor.user().username;
    Meteor.logout(function () {
        Session.set('logoutSuccess', true);
        Session.set('username', username);
        Router.go('landingPage');
    });
};

acceptInvitation = function (context) {
    if (context.status == 0) {
        Meteor.call('addUserToRole', context.productId, Meteor.userId(), context.role, (error) => {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return;
            }
            Meteor.call('createActElUserInvitationAccepted', context.productId, Meteor.userId(), context.role, (error) => {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return;
                }
                Invitations.update({_id: context._id}, {$set: {status: 1}});
            });
        });
    }
};

declineInvitation = function (context) {
    if (context.status == 0 || context.status == 1) {
        Meteor.call('removeUserFromRole', context.productId, Meteor.userId(), context.role, (error) => {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return;
            }
            Meteor.call('createActElUserInvitationDeclined', context.productId, Meteor.userId(), context.role, (error) => {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return;
                }
                Invitations.update({_id: context._id}, {$set: {status: 2}});
            });
        });
    }
};