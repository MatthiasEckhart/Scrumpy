"use strict";

Template.privateMessageText.helpers({
    date: function () {
        return moment(this.submitted).format('MMMM Do YYYY, h:mm:ss a');
    },
    user: function () {
        return Users.findOne({username: this.author});
    },
    authorIsCurrentUser: function () {
        return this.author === Meteor.user().username;
    },
    isInvitation: function () {
        return !_.isEmpty(this.invitations);
    },
    role: function () {
        var developmentTeam, scrumMaster = [], devTeamIds;
        if (_.has(this.invitations, "developmentTeam")) {
            devTeamIds = this.invitations.developmentTeam;
            developmentTeam = _.pluck(Invitations.find({_id: {$in: devTeamIds}}).fetch(), 'username');
        }
        if (_.has(this.invitations, "scrumMaster")) {
            scrumMaster = _.pluck(Invitations.find({_id: this.invitations.scrumMaster}).fetch(), 'username');
        }
        if ($.inArray(Meteor.user().username, developmentTeam) != -1) {
            return "developer";
        } else if ($.inArray(Meteor.user().username, scrumMaster) != -1) {
            return "Scrum Master";
        }
    },
    invitedUsers: function () {
        var developmentTeam, scrumMaster = [], devTeamIds, invitedUsernames;
        if (_.has(this.invitations, "developmentTeam")) {
            devTeamIds = this.invitations.developmentTeam;
            developmentTeam = _.pluck(Invitations.find({_id: {$in: devTeamIds}}).fetch(), 'username');
        }
        if (_.has(this.invitations, "scrumMaster")) {
            scrumMaster = _.pluck(Invitations.find({_id: this.invitations.scrumMaster}).fetch(), 'username');
        }
        invitedUsernames = _.union(developmentTeam, scrumMaster);
        return Users.find({username: {$in: invitedUsernames}});
    },
    invitationStatusContext: function (status) {
        return checkInvitationStatus(status, this, Meteor.user().username);
    },
    invitationStatusParentContext: function (status) {
        return checkInvitationStatus(status, Template.parentData(1), this.username);
    },
    currentUserIsInvited: function () {
        var developmentTeam, scrumMaster = [], devTeamIds;
        if (_.has(this.invitations, "developmentTeam")) {
            devTeamIds = this.invitations.developmentTeam;
            developmentTeam = _.pluck(Invitations.find({_id: {$in: devTeamIds}}).fetch(), 'username');
        }
        if (_.has(this.invitations, "scrumMaster")) {
            scrumMaster = _.pluck(Invitations.find({_id: this.invitations.scrumMaster}).fetch(), 'username');
        }
        return ($.inArray(Meteor.user().username, developmentTeam) != -1) || ($.inArray(Meteor.user().username, scrumMaster) != -1);
    }
});

function checkInvitationStatus(status, data, username) {
    var invStatus = false, members = data.invitations;
    if (_.has(members, 'developmentTeam')) {
        Invitations.find({_id: {$in: members.developmentTeam}}).forEach(function (user) {
            if (user.username == username && user.status == status) {
                invStatus = true;
            }
        });
    }
    if (_.has(members, 'scrumMaster')) {
        var scrumMaster = Invitations.findOne({_id: members.scrumMaster});
        if (scrumMaster.username == username && scrumMaster.status == status) {
            invStatus = true;
        }
    }
    return invStatus;
}

Template.privateMessageText.events({
    'click .accept-invitation': function (e) {
        e.preventDefault();
        var productId = Template.parentData(1).productId, role;
        Meteor.call('modifyUserInvitation', productId, Meteor.user(), 1, function (error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
            role = 0;
            if (Roles.userIsInRole(Meteor.user(), [productId], 'developmentTeam')) {
                role = 1;
            } else if (Roles.userIsInRole(Meteor.user(), [productId], 'scrumMaster')) {
                role = 2;
            }
            Meteor.call('createActElUserInvitationAccepted', productId, Meteor.user()._id, role, 1, function (error) {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return null;
                }
            });
        });
    },
    'click .decline-invitation': function (e) {
        e.preventDefault();
        var productId = Template.parentData(1).productId;
        Meteor.call('modifyUserInvitation', productId, Meteor.user(), 2, function (error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
        });
        Meteor.call('leavePrivateMessage', Template.parentData(1)._id, Meteor.user()._id, function (error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
        });
        Meteor.call('createActElUserInvitationDeclined', productId, Meteor.user()._id, 0, function (error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
        });
        Router.go('privateMessagesList');
    }
});