"use strict";

Template.newSticky.rendered = function () {
    var parentDataContext = Template.parentData(1),
        storyId = this.data._id,
        newStickyEditableSelector = $('#new-sticky-' + storyId);

    newStickyEditableSelector.editable({
        title: 'New sticky',
        display: false,
        placement: 'right',
        validate: function(value) {
            if ($.trim(value.title) === '' || $.trim(value.description) === '' || $.trim(value.effort) === '') {
                return 'Please fill in all details.';
            }
        },
        success: function (response, result) {
            if (result) {
                var user = Meteor.user(),
                    newSticky = {
                        userId: user._id,
                        title: result.title,
                        description: result.description,
                        effort: parseInt(result.effort, 10),
                        productId: parentDataContext._id,
                        storyId: storyId,
                        status: 1,
                        submitted: new Date(),
                        author: user.username,
                        lastMoved: user.username,
                        lastEdited: user.username,
                        assigneeId: "",
                        lastModified: new Date()
                    },
                    story = UserStories.findOne({_id: storyId}),
                    product = Products.findOne({_id: parentDataContext._id}),
                    sprint;

                Stickies.insert(newSticky);

                if (product.advancedMode) {
                    sprint = Sprints.findOne({_id: story.sprintId});
                    Meteor.call('updateBurndown', sprint._id, function (err) {
                        if (err) {
                            alert(err);
                        }
                    });
                    Meteor.call('createActElStickyCreate', newSticky.productId, Meteor.user()._id, newSticky.title, story.title, sprint.goal, function (error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                    });
                }
                throwAlert("success", "Nice!", "Sticky added.");
            } else {
                throwAlert("error", "Title missing!", "Please name your new Sticky.");
            }
        }
    });
};

// x-editable custom field for new sticky button
(function($) {

    var Sticky = function(options) {
        this.init('sticky', options, Sticky.defaults);
    };

    // inherit from Abstract input
    $.fn.editableutils.inherit(Sticky, $.fn.editabletypes.abstractinput);

    $.extend(Sticky.prototype, {
        /**
         Renders input from tpl

         @method render()
         **/
        render: function () {
            this.$input = this.$tpl.find('input');
            this.$select = this.$tpl.find('select');
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
            var html = $('<div>').text(value.title).html() + ', ' + $('<div>').text(value.description).html() + ', ' + $('<div>').text(value.effort).html();
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
            this.$select.filter('[name="effort"]').val("");
        },

        /**
         Returns value of input.

         @method input2value()
         **/
        input2value: function() {
            return {
                title: this.$input.filter('[name="title"]').val(),
                description: this.$input.filter('[name="description"]').val(),
                effort: this.$select.filter('[name="effort"]').val()
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
            this.$input.keydown(function (e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
            });
        }
    });

    Sticky.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="editable-sticky"><label><span>Title: </span><input type="text" name="title" class="input-small"></label></div>' +
        '<div class="editable-sticky"><label><span>Description: </span><input type="text" name="description" class="input-small"></label></div>' +
        '<div class="editable-sticky"><label><span>Estimated effort (h): </span><select name="effort"><option value="2">2</option><option value="4">4</option><option value="6">6</option><option value="8">8</option></select></label></div>',

        inputclass: ''
    });

    $.fn.editabletypes.sticky = Sticky;

}(window.jQuery));