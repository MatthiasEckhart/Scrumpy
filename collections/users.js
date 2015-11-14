Users = Meteor.users;

Users.deny({
    insert: denyPermission,
    remove: denyPermission
});

Users.allow({
    update: ownsDocument
});

Schema.UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        optional: true,
        label: "First name"
    },
    lastName: {
        type: String,
        optional: true,
        label: "Last name"
    },
    organization: {
        type: String,
        optional: true,
        label: "Organization"
    },
    website: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true,
        label: "Website"
    },
    bio: {
        type: String,
        optional: true,
        label: "Bio"
    },
    color: {
        type: String,
        label: "Color",
        autoform: {
            type: "bootstrap-minicolors"
        },
        regEx: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    },
    image: {
        type: String,
        optional: true,
        label: "Profile Image",
        autoform: {
            omit: "true"
        }
    }
});

Schema.User = new SimpleSchema({
    username: {
        type: String,
        label: "Username",
        autoform: {
            omit: true
        }
    },
    profile: {
        type: Schema.UserProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true,
        autoform: {
            omit: true
        }
    },
    roles: {
        type: Object,
        optional: true,
        blackbox: true,
        autoform: {
            omit: true
        }
    },
    notifications: {
        type: [String],
        autoform: {
            omit: true
        }
    },
    createdAt: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) return new Date;
            else if (this.isUpsert) return {$setOnInsert: new Date};
            else
            /* Prevent user from supplying their own date. */
                this.unset();
        },
        autoform: {
            omit: true
        }
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            if (this.isInsert || this.isUpdate) return new Date;
            else if (this.isUpsert) return {$setOnInsert: new Date};
            else
            /* Prevent user from supplying their own date. */
                this.unset();
        },
        autoform: {
            omit: true
        }
    }
});

Users.attachSchema(Schema.User);

Schema.changePassword = new SimpleSchema({
    newPassword: {
        type: String,
        label: "New Password",
        min: 6
    },
    passwordConfirmation: {
        type: String,
        min: 6,
        label: "Password Confirmation",
        custom: function () {
            if (this.value !== this.field('newPassword').value) return "passwordMissmatch";
            else return true;
        }
    },
    currentPassword: {
        type: String,
        min: 6,
        label: "Current Password"
    },
    userId: {
        type: String,
        custom: function () {
            if (this.value !== Meteor.userId()) return "notAllowed";
            else return true;
        },
        autoform: {
            omit: true
        }
    }
});

Schema.register = new SimpleSchema({
    username: {
        type: String,
        label: "Username",
        regEx: /^[a-z0-9A-Z_]{3,15}$/,
        custom: function () {
            if (Meteor.isClient && this.isSet) {
                Meteor.call("isUsernameAvailable", this.value, function (error) {
                    if (error) Schema.register.namedContext("register-form").addInvalidKeys([{
                        name: "username",
                        type: "usernameAlreadyExists"
                    }]);
                });
            }
        }
    },
    password: {
        type: String,
        min: 6,
        label: "Password"
    },
    passwordConfirmation: {
        type: String,
        min: 6,
        label: "Password Confirmation",
        custom: function () {
            if (this.value !== this.field('password').value) return "passwordMissmatch";
            else return true;
        }
    }
});

Schema.login = new SimpleSchema({
    username: {
        type: String,
        label: "Username",
        regEx: /^[a-z0-9A-Z_]{3,15}$/
    },
    password: {
        type: String,
        label: "Password"
    }
});

SimpleSchema.messages({
    usernameAlreadyExists: "A user account already exists with this username. If this is you, you may want to sign in instead. Otherwise, please check your spelling and try again.",
    userNotFound: "User not found. Please check your spelling or sign up first.",
    incorrectPassword: "Incorrect password",
    passwordNotSet: "You have not yet set a password. Please visit the link in the e-mail we sent you."
});