"use strict";

Template.privateMessageCreateEditableButton.rendered = function () {
    Session.set('pmCreateEditable', false);
    var recipientsUsername = this.data.username, participants, privateMessageAttributes;

    if (Meteor.user().username !== recipientsUsername) {
        $('.private-message-create-editable').editable({
            title: 'Please fill out all details',
            placement: 'right',
            display: false,
            success: function (response, newValue) {
                if (newValue) {
                    var firstMessage = {
                        'text': newValue.message,
                        'submitted': new Date(),
                        'author': Meteor.user().username
                    };
                    participants = [recipientsUsername];
                    participants.push(Meteor.user().username);
                    privateMessageAttributes = {
                        subject: newValue.subject,
                        participants: participants,
                        messages: [firstMessage]
                    };
                    Meteor.call('createPrivateMessage', privateMessageAttributes, function (error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                    });
                    Session.set('pmCreateEditable', true);
                } else {
                    throwAlert("error", "Title missing!", "Please name your new Sticky.");
                }
            }
        });
    }
};

Template.privateMessageCreateEditableButton.helpers({
    isCurrUser: function () {
        return Meteor.user().username === this.username;
    }
});

// x-editable custom field for new private message button
(function ($) {

    var Pm = function (options) {
        this.init('pm', options, Pm.defaults);
    };

    //inherit from Abstract input
    $.fn.editableutils.inherit(Pm, $.fn.editabletypes.abstractinput);

    $.extend(Pm.prototype, {
        /**
         Renders input from tpl

         @method render()
         **/
        render: function () {
            this.$input = this.$tpl.find('input');
        },

        /**
         Default method to show value in element. Can be overwritten by display option.

         @method value2html(value, element)
         **/
        value2html: function (value, element) {
            if (!value) {
                $(element).empty();
                return;
            }
            var html = $('<div>').text(value.subject).html() + ', ' + $('<div>').text(value.message).html();
            $(element).html(html);
        },

        /**
         Converts value to string.
         It is used in internal comparing (not for sending to server).

         @method value2str(value)
         **/
        value2str: function (value) {
            var str = '';
            if (value) {
                for (var k in value) {
                    str = str + k + ':' + value[k] + ';';
                }
            }
            return str;
        },


        /**
         Sets value of input.

         @method value2input(value)
         @param {mixed} value
         **/
        value2input: function (value) {
            if (!value) {
                return;
            }
            this.$input.filter('[name="subject"]').val(value.subject);
            this.$input.filter('[name="message"]').val(value.message);
        },

        /**
         Returns value of input.

         @method input2value()
         **/
        input2value: function () {
            return {
                subject: this.$input.filter('[name="subject"]').val(),
                message: this.$input.filter('[name="message"]').val()
            };
        },

        /**
         Activates input: sets focus on the first field.

         @method activate()
         **/
        activate: function () {
            this.$input.filter('[name="subject"]').focus();
        },

        /**
         Attaches handler to submit form in case of 'showbuttons=false' mode

         @method autosubmit()
         **/
        autosubmit: function () {
            this.$input.keydown(function (e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
            });
        }
    });

    Pm.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="editable-pm"><label><span>Subject: </span><input type="text" name="subject" class="input-small"></label></div>' +
        '<div class="editable-pm"><label><span>Message: </span><input type="text" name="message" class="input-small"></label></div>',

        inputclass: ''
    });

    $.fn.editabletypes.pm = Pm;

}(window.jQuery));