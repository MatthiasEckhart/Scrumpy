"use strict";

Template.layout.helpers({
    isLoginOrRegisterRoute: function () {
        var routeName = Router.current().route.getName();
        return (routeName === "login" || routeName === "register");
    }
});