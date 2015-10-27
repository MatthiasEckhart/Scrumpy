"use strict";

Template.register.helpers({
    registerSchema: function () {
        return Schema.register;
    }
});

Template.register.onRendered(function () {
    particlesJS.load('particles-js', '/particles.json', function () {
    });
});