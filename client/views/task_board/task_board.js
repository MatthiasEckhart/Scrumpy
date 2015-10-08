"use strict";

var storyId, productId, routerStartDate, routerEndDate;

Template.taskBoard.helpers({
    userStories: function () {
        if (productIsAdvancedModeStartDateEndDate(this.advancedMode)) {
            return UserStories.find({productId: this._id, sprintId: getSprintId(this._id)}, {sort: {priority: 1}});
        }
        return UserStories.find({productId: this._id});
    },
    stickyType: function (type) {
        return Stickies.find({storyId: this._id, status: parseInt(type, 10)}, {sort: {lastModified: -1}});
    },
    sumEffort: function (type) {
        var sumEffort = 0,
            userStoryIdsArr;
        if (productIsAdvancedModeStartDateEndDate(this.advancedMode)) {
            userStoryIdsArr = [];
            UserStories.find({productId: this._id, sprintId: getSprintId(this._id)}).forEach(function (story) {
               userStoryIdsArr.push(story._id);
            });
            Stickies.find({productId: this._id, storyId: {$in: userStoryIdsArr}, status: parseInt(type, 10)}).forEach(function (sticky) {
                sumEffort += parseInt(sticky.effort, 10);
            });
        } else {
            Stickies.find({productId: this._id, status: parseInt(type, 10)}).forEach(function (sticky) {
                sumEffort += parseInt(sticky.effort, 10);
            });
        }
        return sumEffort;
    }
});

Template.taskBoard.created = function () {
    if (productIsAdvancedModeStartDateEndDate(this.data.advancedMode)) {
        routerStartDate = moment(Router.current().params.startDate).toDate();
        routerEndDate = moment(Router.current().params.endDate).toDate();
    }
};

Template.taskBoard.rendered = function () {
    var productId = this.data._id;
    $('#new-user-story-editable').editable({
        title: 'New user story',
        display: false,
        placement: 'right',
        validate: function (value) {
            if ($.trim(value.title) === '' || $.trim(value.description) === '') {
                return 'Please fill in all details.';
            }
        },
        value: "",
        success: function (response, newValue) {
            if (newValue) {
                var newStory = {
                    userId: Meteor.userId(),
                    title: newValue.title,
                    description: newValue.description,
                    productId: productId,
                    submitted: new Date(),
                    author: Meteor.user().username,
                    lastEdited: Meteor.user().username
                };
                UserStories.insert(newStory);
                throwAlert('success', 'Yes!', 'Story added.');
            }
        }
    });
};

function getSprintId(productId) {
    var sprint = Sprints.findOne({productId: productId, startDate: routerStartDate, endDate: routerEndDate});
    if (sprint) {
        return sprint._id;
    }
    return null;
}

// x-editable custom field for new user story button
(function($) {

    var UserStory = function(options) {
        this.init('userStory', options, UserStory.defaults);
    };

    //inherit from Abstract input
    $.fn.editableutils.inherit(UserStory, $.fn.editabletypes.abstractinput);

    $.extend(UserStory.prototype, {
        /**
         Renders input from tpl

         @method render()
         **/
        render: function() {
            this.$input = this.$tpl.find('input');
        },

        /**
         Default method to show value in element. Can be overwritten by display option.

         @method value2html(value, element)
         **/
        value2html: function(value, element) {
            if (!value) {
                $(element).empty();
                return;
            }
            var html = $('<div>').text(value.title).html() + ', ' + $('<div>').text(value.description).html();
            $(element).html(html);
        },

        /**
         Converts value to string.
         It is used in internal comparing (not for sending to server).

         @method value2str(value)
         **/
        value2str: function(value) {
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
        value2input: function(value) {
            if (!value) {
                return;
            }
            this.$input.filter('[name="title"]').val("");
            this.$input.filter('[name="description"]').val("");
        },

        /**
         Returns value of input.

         @method input2value()
         **/
        input2value: function() {
            return {
                title: this.$input.filter('[name="title"]').val(),
                description: this.$input.filter('[name="description"]').val()
            };
        },

        /**
         Activates input: sets focus on the first field.

         @method activate()
         **/
        activate: function() {
            this.$input.filter('[name="title"]').focus();
        },

        /**
         Attaches handler to submit form in case of 'showbuttons=false' mode

         @method autosubmit()
         **/
        autosubmit: function() {
            this.$input.keydown(function(e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
            });
        }
    });

    UserStory.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="editable-user-story"><label><span>Title: </span><input type="text" name="title" class="input-small"></label></div>' +
        '<div class="editable-user-story"><label><span>Description: </span><input type="text" name="description" class="input-small"></label></div>',

        inputclass: ''
    });

    $.fn.editabletypes.userStory = UserStory;

}(window.jQuery));