"use strict";

Template.settingsPage.helpers({
    stickyHeaderColor: function () {
        return Meteor.user().profile.color;
    }
});

Template.settingsPage.onRendered(function () {
    var colorpickerEl = $('select[name="colorpicker-bootstrap3-form"]');
    colorpickerEl.simplecolorpicker();
    colorpickerEl.simplecolorpicker('selectColor', this.data.profile.color);
    colorpickerEl.simplecolorpicker({
        picker: true
    }).on('change', function () {
        Meteor.call('updateUserColor', Meteor.userId(), colorpickerEl.val(), function (err) {
            if (err) {
                throwAlert('error', 'Sorry!', err.message);
                return null;
            }
        });
    });
});