"use strict";

Template.landingPage.onRendered(function () {
    particlesJS.load('particles-js', '/particles.json', function () {
    });
    if (Session.equals("logoutSuccess", true)) {
        throwAlert('info', 'Bye ' + Session.get('username') + '!', 'Come back whenever you want!');
        Session.set('logoutSuccess', false);
        Session.set('username', false);
    }
});