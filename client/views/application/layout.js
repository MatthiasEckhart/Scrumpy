"use strict";

Template.layout.events({
    'click .sign-out': function () {
        let username = Meteor.user().username;
        Meteor.logout(function () {
            Session.set('logoutSuccess', true);
            Session.set('username', username);
            Router.go('landingPage');
        });
    },
    'click .accept-invitation': function () {
        if (this.status == 0) {
            Meteor.call('addUserToRole', this.productId, Meteor.userId(), this.role, (error) => {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return;
                }
                Meteor.call('createActElUserInvitationAccepted', this.productId, Meteor.userId(), this.role, (error) => {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return;
                    }
                    Invitations.update({_id: this._id}, {$set: {status: 1}});
                });
            });
        }
    },
    'click .decline-invitation': function () {
        if (this.status == 0 || this.status == 1) {
            Meteor.call('removeUserFromRole', this.productId, Meteor.userId(), this.role, (error) => {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return;
                }
                Meteor.call('createActElUserInvitationDeclined', this.productId, Meteor.userId(), this.role, (error) => {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return;
                    }
                    Invitations.update({_id: this._id}, {$set: {status: 2}});
                });
            });
        }
    }
});