"use strict";

Accounts.onCreateUser(function (options, user) {
    user.profile = {firstName: "", lastName: "", organization: "", image: "", color: getRandomColor()};
    user.privateMessages = [];
    user.notifications = [];
    return user;
});

var colors = ["#7bd148", "#5484ed", "#a4bdfc", "#46d6db", "#7ae7bf", "#51b749", "#fbd75b", "#ffb878", "#ff887c", "#dc2127", "#dbadff", "#e1e1e1"];

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}