"use strict";

Template.login.helpers({
    loginSchema: function () {
        return Schema.login;
    }
});

Template.login.onRendered(function () {
    particlesJS.load('particles-js', '/particles.json', function () {
    });
});