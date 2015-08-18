"use strict";

Template.changePersonalInfo.events({
    "click #save-personal-info-button": function (e, t) {
        e.preventDefault();
        var persInfo = {
            'profile.firstName': t.find('input[name=first-name]').value,
            'profile.lastName': t.find('input[name=last-name]').value,
            'profile.organization': t.find('input[name=organization]').value
        };
        Meteor.call('updatePersInfo', Meteor.userId(), persInfo, function (err) {
            if (err) {
                throwAlert('error', 'Sorry!', err.message);
            }
        });
        throwAlert('success', 'Yippie!', 'Profile information saved!');
    }
});
