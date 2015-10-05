"use strict";

Template.layout.helpers({
    isLoginOrRegisterRoute: function () {
        var route = Router.current().route;
        if (!route) return false;
        var routeName = route.getName();
        return routeName  && (routeName === "login" || routeName === "register");
    }
});