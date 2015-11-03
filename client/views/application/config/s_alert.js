"use strict";

Meteor.startup(function () {
    sAlert.config({
        effect: 'stackslide',
        position: 'bottom',
        timeout: 6000,
        html: true,
        onRouteClose: true,
        stack: true,
        offset: 0,
        beep: false
    });
});