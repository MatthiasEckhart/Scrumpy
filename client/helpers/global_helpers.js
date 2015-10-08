UI.registerHelper('titleShort', function (type) {
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

UI.registerHelper('representative', function () {
    if (!_.isUndefined(Products) && !_.isNull(Products)) {
        var product = Products.findOne({_id: this._id});
        if (!_.isNull(product)) {
            if (product.advancedMode) {
                return 'Product Owner';
            }
            return 'Administrator';
        }
    }
});

UI.registerHelper('currentUserUsername', function () {
    return Meteor.user().username;
});

UI.registerHelper('defaultAvatar', function () {
    return DEFAULTAVATAR;
});

UI.registerHelper('noAvatar', function (type) {
    var user;
    if (type === "assignee") {
        user = Users.findOne({_id: this.assigneeId});
        if (user) return user.profile.image.length === 0;
    } else if (type === "currentUser") return Meteor.user().profile.image.length === 0;
    else if (type === "profile") return this.profile.image.length === 0;
    else if (type === "productOwnerOrAdministrator") {
        user = Users.findOne({_id: this.userId});
        if (user) return user.profile.image.length === 0;
    }
});

UI.registerHelper('navTabIsActive', function (navTab) {
    return Session.equals('activeNavTab', navTab);
});

UI.registerHelper('advancedMode', function (formId) {
    if (_.has(this, "advancedMode")) {
        return this.advancedMode;
    }
    return AutoForm.getFieldValue('advancedMode', formId);
});

UI.registerHelper('totalDevTeamMember', function () {
    return Invitations.find({productId: this._id, role: 3}, {$and: [{status: 0}, {status: 1}]}).count();
});

UI.registerHelper('totalScrumMaster', function () {
    return Invitations.find({productId: this._id, role: 2}, {$and: [{status: 0}, {status: 1}]}).count();
});

UI.registerHelper('teamOverview', function (role) {
    return Invitations.find({productId: this._id, role: parseInt(role, 10)}).map(function (document, index) {
        document.isAlreadyInRole = document.status == 1;
        let user = Users.findOne({_id: document.userId});
        if (user) document.username = user.username;
        else document.username = "Anonymous";
        document.index = index + 1;
        return document;
    });
});

UI.registerHelper('isOnline', function () {
    if (_.has(this, 'profile') && _.has(this.profile, 'online')) {
        return this.profile.online;
    } else {
        var user = Users.findOne({username: this.username});
        if (user && _.has(user, 'profile') && _.has(user.profile, 'online')) {
            return user.profile.online;
        }
    }
});

UI.registerHelper('avatar', function () {
    if (this.profile.image) return this.profile.image;
    else return DEFAULTAVATAR;
});

UI.registerHelper('userIsScrumMaster', function (template) {
    if (template === "sprint") {
        return Roles.userIsInRole(Meteor.user(), [Template.parentData(2)._id], 'scrumMaster');
    } else if (template === "sprintPlanning") {
        return Roles.userIsInRole(Meteor.user(), [this._id], 'scrumMaster');
    }
});

UI.registerHelper('sprintStartDateFormatted', function () {
    return moment(this.startDate).format('YYYY-MM-DD');
});

UI.registerHelper('sprintEndDateFormatted', function () {
    return moment(this.endDate).format('YYYY-MM-DD');
});

UI.registerHelper('fullName', function () {
    if (this && _.has(this.profile, 'firstName') && _.has(this.profile, 'lastName')) return this.profile.firstName + " " + this.profile.lastName;
    else return "";
});

UI.registerHelper('userIsProductOwner', function (template) {
    var productId;
    if (template === "userStory") {
        productId = this.productId;
    } else { // template -> sprintPlanning or productPageIncludes
        productId = this._id;
    }
    return Roles.userIsInRole(Meteor.user(), [productId], 'productOwner');
});

checkMemberDuplicates = function (compareString, table) {
    var dupl = false;
    $(table).each(function () {
        if ($(this).text() == compareString) {
            dupl = true;
        }
    });
    return dupl;
};

highlightCounterOnPanel = function (type) {
    if (type == 'DevelopmentTeam') {
        $('div#panel-development-team.panel.panel-warning div.panel-heading h3.panel-title span.badge.badge-default.pull-right').effect('highlight');
    } else if (type == 'ScrumMaster') {
        $('div#panel-scrum-master.panel.panel-info div.panel-heading h3.panel-title span.badge.badge-default.pull-right').effect('highlight');
    } else if (type == 'Recipients') {
        $('div#panel-recipients.panel.panel-success div.panel-heading h3.panel-title span.badge.badge-default.pull-right').effect('highlight');
    }
};

dissociateScrumMaster = function (e) {
    e.preventDefault();
    ScrumMaster.remove({_id: $(e.target).attr('name')});
    highlightCounterOnPanel("ScrumMaster");
    $('#assign-as-scrum-master').removeClass('disabled');
};

var checkboxSelector = '.checkbox-multiple-select';

assignAsScrumMaster = function () {
    $(checkboxSelector).each(function () {
        if (this.checked) {
            if (ScrumMaster.find().count() === 0) {
                if (DevelopmentTeam.find({username: $(this).val()}).count() === 0) {
                    ScrumMaster.insert({username: $(this).val(), isAlreadyInRole: false, isAlreadyInvited: false});
                    $('#assign-as-scrum-master').addClass('disabled');
                    highlightCounterOnPanel("ScrumMaster");
                } else {
                    throwAlert('error', 'Sorry!', "You can't have the same person as Scrum Master and part of the Development Team.");
                }
            } else {
                throwAlert('error', 'Sorry!', 'You can assign only one person as scrum master.');
            }
        }
    });
};

deleteMemberFromDevelopmentTeam = function (e) {
    e.preventDefault();
    DevelopmentTeam.remove({_id: $(e.target).attr('name')});
    highlightCounterOnPanel("DevelopmentTeam");
};

addToDevelopmentTeam = function () {
    $(checkboxSelector).each(function () {
        if (this.checked) {
            if (DevelopmentTeam.find({username: $(this).val()}).count() === 0) {
                if (ScrumMaster.find({username: $(this).val()}).count() === 0) {
                    DevelopmentTeam.insert({username: $(this).val(), isAlreadyInRole: false, isAlreadyInvited: false});
                    highlightCounterOnPanel("DevelopmentTeam");
                } else {
                    throwAlert('error', 'Sorry!', "You can't have the same person as Scrum Master and part of the Development Team.");
                }
            } else {
                throwAlert('error', 'Sorry!', "You can't add the same person twice.");
            }
        }
    });
};

addToRecipientsList = function () {
    $(checkboxSelector).each(function () {
        if (this.checked) {
            if (Recipients.find({username: $(this).val()}).count() === 0) {
                Recipients.insert({username: $(this).val()});
                highlightCounterOnPanel("Recipients");
            } else {
                throwAlert('error', 'Sorry!', "You can't add the same person twice.");
            }
        }
    });
};

removeRecipient = function (e) {
    e.preventDefault();
    Recipients.remove({_id: $(e.target).attr('name')});
    highlightCounterOnPanel("Recipients");
};

operateDatepicker = function (datepickerStatus, selector) {
    if (!datepickerStatus) {
        $(selector).datepicker("show");
        datepickerStatus = true;
    } else {
        $(selector).datepicker("hide");
        datepickerStatus = false;
    }
    return datepickerStatus;
};

isNotEmpty = function (selector, value) {
    if (value && value !== '') {
        return true;
    } else {
        highlightWarningForField(selector);
        return false;
    }
};

highlightWarningForField = function (selector) {
    $(selector).parent().addClass('has-warning has-feedback');
    if ($(selector).parent().children().length === 1) {
        $(selector).parent().append($('<span/>', {'class': 'glyphicon glyphicon-warning-sign form-control-feedback'}));
    }
};

highlightErrorForField = function (selector) {
    $(selector).parent().addClass('has-error has-feedback');
    if ($(selector).parent().children().length === 1) {
        $(selector).parent().append($('<span/>', {'class': 'glyphicon glyphicon-remove form-control-feedback'}));
    }
};

resetAlertsForFields = function () {
    $('.form-control').each(function () {
        $(this).parent().removeClass('has-warning').removeClass('has-error');
        $(this).parent().find('span').remove();
    });
};

isValidPassword = function (password) {
    if (password.length < 6) {
        highlightWarningForRegisterPasswordFields();
        throwAlert('warning', 'Error', 'Your password should be 6 characters or longer.');
        return false;
    }
    return true;
};

areValidPasswords = function (password, confirm) {
    if (!isValidPassword(password)) {
        return false;
    }
    if (password !== confirm) {
        highlightWarningForRegisterPasswordFields();
        throwAlert('warning', 'Error', 'Your two passwords are not equivalent.');
        return false;
    }
    return true;
};

operateMultipleSelect = function (selector) {
    if (!selector.hasClass('selected')) {
        selector.addClass('selected');
    } else {
        selector.removeClass('selected');
    }
};

createStory = function (story, titleInput, descInput) {
    var storyId = UserStories.insert(story);
    titleInput.value = "";
    descInput.value = "";

    throwAlert('success', 'Yeah!', 'The story creation was successful.');
    $('#' + storyId + ' .story').effect('highlight');
};

setSessionForActiveNavTab = function (name) {
    Session.set('activeNavTab', name);
};

/* Returns slug from router parameters. */
getRouteSlug = function () {
    return Router.current().params.slug;
};

function highlightWarningForRegisterPasswordFields() {
    highlightWarningForField('#register-password');
    highlightWarningForField('#register-password-confirm');
}