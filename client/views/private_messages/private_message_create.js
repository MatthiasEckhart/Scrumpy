"use strict";

Template.privateMessageCreate.events({
    'submit form': function (e) {
        e.preventDefault();

        var firstMessage = {
            'text': $(e.target).find('[name=message]').val(),
            'submitted': new Date(),
            'author': Meteor.user().username
        }, participants = Recipients.find().map(function (document) {
            return document.username;
        }), privateMessageAttributes;

        participants.push(Meteor.user().username);

        privateMessageAttributes = {
            subject: $(e.target).find('[name=subject]').val(),
            participants: participants,
            messages: [firstMessage]
        };

        if (!privateMessageAttributes.subject) {
            highlightErrorForField('#subject-input');
        }

        Meteor.call('createPrivateMessage', privateMessageAttributes, function (error, privateMessageSlug) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
            Router.go('privateMessage', {slug: privateMessageSlug});
        });
    },
    'click #add-to-recipients-list': function () {
        addToRecipientsList();
    },
    'click .remove-recipient': function (e) {
        removeRecipient(e);
    }
});

Template.privateMessageCreate.helpers({
    recipients: function () {
        return Recipients.find().map(function (document, index) {
            document.index = index + 1;
            return document;
        });
    },
    totalRecipients: function () {
        return Recipients.find().count();
    }
});