"use strict";

var advancedMode;

Template.productCreate.events({
    'submit form': function (e) {
        e.preventDefault();

        var product = {
            title: $(e.target).find('[name=title]').val(),
            advancedMode: $(e.target).find('[name=advancedMode]').is(':checked')
        };

        if (!product.title) {
            highlightErrorForField('#title-input');
        }

        if (product.advancedMode) {
            product.vision = $(e.target).find('[name=vision]').val();
            if (!product.vision) {
                highlightErrorForField('#vision-input');
            }
        }

        Meteor.call('createProduct', product, function (error, createdProduct) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }

            var developmentTeam = DevelopmentTeam.find().map(function (document) {
                return document.username;
            }), participants, invDev, administrator, i, firstMessage, invDevId, invId, privateMessageAttributes, productOwner, scrumMasterArr, scrumMaster, scrumMasterObj, invSId;

            if (!createdProduct.advancedMode) { // advanced mode off, create product-id role and groups: administrator & development team
                administrator = Meteor.user().username;
                Meteor.call('createRole', createdProduct._id, administrator, function (error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });

                participants = _.union([Meteor.user().username], developmentTeam);
                invDev = [];
                for (i = 0; i < developmentTeam.length; i++) {
                    invDev.push({username: developmentTeam[i], status: 0});
                }
                firstMessage = {'submitted': new Date(), 'author': Meteor.user().username};

                if (invDev.length > 0) {
                    firstMessage.invitations = {};
                    invDevId = [];
                    _.each(invDev, function (user) {
                        invId = Invitations.insert(user);
                        invDevId.push(invId);
                    });
                    firstMessage.invitations.developmentTeam = invDevId;
                }

                privateMessageAttributes = {
                    subject: createdProduct.title,
                    participants: participants,
                    messages: [firstMessage],
                    productId: createdProduct._id
                };

                Meteor.call('createPrivateMessage', privateMessageAttributes, function (error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });
                clearDevTeam();
                Router.go('taskBoardPage', {slug: createdProduct.slug});
            } else { // advanced mode on, create product-id role and groups: product owner, scrum master & development team
                productOwner = Meteor.user().username;
                scrumMasterArr = ScrumMaster.find().map(function (document) {
                    return document.username;
                });
                scrumMaster = scrumMasterArr[0];
                Meteor.call('createRoleAdvanced', createdProduct._id, productOwner, function (error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });

                participants = _.union([Meteor.user().username], developmentTeam, scrumMaster);
                invDev = [];
                for (i = 0; i < developmentTeam.length; i++) {
                    invDev.push({username: developmentTeam[i], status: 0});
                }

                firstMessage = {'submitted': new Date(), 'author': Meteor.user().username};

                if (invDev.length > 0 || scrumMaster) {
                    firstMessage.invitations = {};
                }

                if (invDev.length > 0) {
                    invDevId = [];
                    _.each(invDev, function (user) {
                        invId = Invitations.insert(user);
                        invDevId.push(invId);
                    });
                    firstMessage.invitations.developmentTeam = invDevId;
                }

                if (scrumMaster) {
                    scrumMasterObj = {username: scrumMaster, status: 0};
                    invSId = Invitations.insert(scrumMasterObj);
                    firstMessage.invitations.scrumMaster = invSId;
                }

                privateMessageAttributes = {
                    subject: createdProduct.title,
                    participants: participants,
                    messages: [firstMessage],
                    productId: createdProduct._id
                };

                Documents.insert({title: "Definition of Done", productId: createdProduct._id});
                Documents.insert({title: "Team availability", productId: createdProduct._id});
                Documents.insert({title: "Stakeholders", productId: createdProduct._id});

                Meteor.call('createPrivateMessage', privateMessageAttributes, function (error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });

                Meteor.call('createActElProductCreate', createdProduct._id, Meteor.user()._id, function (error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });
                clearDevTeam();
                clearScrumMaster();
                Router.go('sprintPlanning', {slug: createdProduct.slug});
            }
        });
    },
    'click input[name=advancedMode]': function () {
        if (Session.equals('advancedMode', false)) {
            Session.set('advancedMode', true);
        } else {
            Session.set('advancedMode', false);
            // Move Scrum Master to development team
            var scrumMaster = ScrumMaster.find().fetch();
            DevelopmentTeam.insert(scrumMaster[0]);
            highlightCounterOnPanel("DevelopmentTeam");
        }
    },
    'click #add-to-development-team': function () {
        addToDevelopmentTeam();
    },
    'click .delete-member-from-development-team': function (e) {
        deleteMemberFromDevelopmentTeam(e);
    },
    'click #assign-as-scrum-master': function () {
        assignAsScrumMaster();
    },
    'click .dissociate-scrum-master': function (e) {
        dissociateScrumMaster(e);
    }
});

Template.productCreate.helpers({
    devTeamMember: function() {
        return DevelopmentTeam.find().map(function (document, index) {
            document.index = index + 1;
            return document;
        });
    },
    scrumMaster: function() {
        return ScrumMaster.find().map(function(document, index) {
            document.index = index + 1;
            return document;
        });
    }
});

Template.productCreate.rendered = function() {
    clearDevTeam();
    clearScrumMaster();
    Session.set('advancedMode', false);
    Session.set('productCreateCheckbox', true);
    Session.set('activeNavTab', 'productCreate');
};

Template.productCreate.destroyed = function() {
    Session.set('activeNavTab', null);
    Session.set('productCreateCheckbox', null);
};