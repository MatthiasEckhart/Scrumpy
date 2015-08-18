"use strict";

var advancedMode;

Template.productEdit.events({
    'submit form': function (e) {
        e.preventDefault();

        var oldProduct = Products.findOne({_id: this._id}),
            oldProductTitle = oldProduct.title,
            productProperties = {
                title: $(e.target).find('[name=title]').val(),
                advancedMode: $(e.target).find('[name=advancedMode]').is(':checked'),
                lastModified: new Date(),
                slug: this.slug.substring(0, (this.slug.indexOf('-')) + 1) + slugify($(e.target).find('[name=title]').val())
            };

        if (!productProperties.title) {
            highlightErrorForField('#title-input');
        }

        if (productProperties.advancedMode) {
            productProperties.vision = $(e.target).find('[name=vision]').val();
            if (!productProperties.vision) {
                highlightErrorForField('#vision-input');
            }
        }

        Meteor.call('updateProduct', productProperties, this._id, function (error, createdProduct) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }

            var developmentTeam = DevelopmentTeam.find().map(function (document) { // get all usernames from development team
                return document.username;
            }),
                invMessage = {'submitted': new Date(), 'author': Meteor.user().username}, // basic invitation message object
                newParticipants = [],
                currDevMembersInRole, devMembersInv, invDev, i, invDevTeamIds, scrumMasterArr, scrumMaster,
                currScrumMasterInRole, invScrumMasterId, participantsToRemove, devTeamUsersToRemoveFromInv,
                scrumMasterToRemoveFromInv, pm, invId, developmentTeamIsNotInvited, scrumMasterIsNotInvited;

            if (developmentTeam.length > 0) {
                // get current development team members in role
                currDevMembersInRole = _.map(Roles.getUsersInRole([createdProduct._id], 'developmentTeam').fetch(), function (user) {
                    return user.username;
                });
                // get all development team members who are not already invited to work on the project
                developmentTeamIsNotInvited = [];
                DevelopmentTeam.find().forEach(function (document) {
                    if (!document.isAlreadyInvited) {
                        developmentTeamIsNotInvited.push(document.username);
                    }
                });
                // get only those development team members who are not already invited nor members in role
                devMembersInv = _.difference(developmentTeamIsNotInvited, currDevMembersInRole);
                newParticipants = devMembersInv;
                invDev = [];
                // prepare invitation for development team members (-> collection Invitations)
                for (i = 0; i < devMembersInv.length; i++) {
                    invDev.push({username: devMembersInv[i], status: 0});
                }
                if (invDev.length > 0) {
                    invMessage.invitations = {};
                    invDevTeamIds = [];
                    _.each(invDev, function (inv) {
                        invId = Invitations.insert(inv);
                        invDevTeamIds.push(invId);
                    });
                    invMessage.invitations.developmentTeam = invDevTeamIds;
                }
            }

            if (productProperties.advancedMode) {
                scrumMasterArr = ScrumMaster.find().map(function (document) {
                    return document.username;
                });
                scrumMasterIsNotInvited = [];
                ScrumMaster.find().forEach(function (document) {
                    if (!document.isAlreadyInvited) {
                        scrumMasterIsNotInvited.push(document.username);
                    }
                });
                scrumMaster = scrumMasterIsNotInvited[0];
                // if Scrum Master is not already invited, send new invitation
                if (scrumMaster) {
                    currScrumMasterInRole = _.map(Roles.getUsersInRole([createdProduct._id], 'scrumMaster').fetch(), function (user) {
                        return user.username;
                    });
                    if (scrumMaster !== currScrumMasterInRole[0]) {
                        if (developmentTeam.length === 0) {
                            invMessage.invitations = {};
                        }
                        invScrumMasterId = Invitations.insert({'username': scrumMaster, 'status': 0});
                        invMessage.invitations.scrumMaster = invScrumMasterId;
                        newParticipants.push(scrumMaster);
                    }
                }
            }

            // if product owner removes development team member or Scrum Master from product and they have been already invited
            // we remove them as participants from private message and set a new invitation status
            devTeamUsersToRemoveFromInv = [];
            scrumMasterToRemoveFromInv = null;
            pm = PrivateMessages.findOne({productId: createdProduct._id});
            _.each(pm.messages, function (m) {
                if (_.has(m, "invitations")) {
                    if (_.has(m.invitations, "developmentTeam")) {
                        Invitations.find({_id: {$in: m.invitations.developmentTeam}}).forEach(function (u) {
                            if ($.inArray(u.username, developmentTeam) == -1) {
                                devTeamUsersToRemoveFromInv.push(u.username);
                            }
                        });
                    }
                    if (_.has(m.invitations, 'scrumMaster')) {
                        var invScrumMaster = Invitations.findOne({_id: m.invitations.scrumMaster});
                        if (scrumMaster && invScrumMaster.username !== scrumMaster) {
                            scrumMasterToRemoveFromInv = invScrumMaster.username;
                        }
                    }
                }
            });

            participantsToRemove = devTeamUsersToRemoveFromInv;
            if (scrumMasterToRemoveFromInv) {
                participantsToRemove.push(scrumMasterToRemoveFromInv);
            }

            Meteor.call('updatePrivateMessageStatus', createdProduct._id, participantsToRemove, function (error) {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return null;
                }
            });

            if (newParticipants.length != 0 || participantsToRemove.length != 0) {
                Meteor.call('updateRoleInvitation', invMessage, createdProduct._id, newParticipants, participantsToRemove, function (error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });
            }

            if (productProperties.advancedMode && oldProductTitle != createdProduct.title) {
                Meteor.call('createActElProductTitleEdit', createdProduct._id, Meteor.user()._id, oldProductTitle, function (error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return null;
                    }
                });
            }
            clearDevTeam();
            clearAlerts();
            Router.go('productDashboard', {slug: createdProduct.slug});
        });
    },
    'click #add-to-development-team': function () {
        addToDevelopmentTeam();
    },
    'click .delete-member-from-development-team': function (e) {
        Session.set('scrumTeamStaleState', true);
        deleteMemberFromDevelopmentTeam(e);
    },
    'click #assign-as-scrum-master': function () {
        assignAsScrumMaster();
    },
    'click .dissociate-scrum-master': function (e) {
        Session.set('scrumTeamStaleState', true);
        dissociateScrumMaster(e);
    },
    'click .delete': function (e) {
        e.preventDefault();
        throwDialog('warning', 'Wait!', 'Are you sure you want delete the product ' + this.title + '?', 'Sure, delete it', 'No, do not delete', 'delete-product-confirm', this._id);
    }
});

Template.productEdit.rendered = function () {
    Session.set('advancedMode', this.data.advancedMode);
    Session.set('scrumTeamStaleState', false);
};

Template.productEdit.destroyed = function () {
    Session.set('scrumTeamStaleState', false);
};

Template.productEdit.helpers({
    advancedModeChecked: function () {
        if (this.advancedMode) {
            return "checked";
        } else {
            return "";
        }
    }
});