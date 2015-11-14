UserStories = new Mongo.Collection('userStories');

UserStories.allow({
    insert: scrumTeam,
    update: scrumTeam,
    remove: scrumTeam
});

UserStories.attachSchema(new SimpleSchema({
    title: {
        type: String,
        label: "Title",
        max: 20,
        autoform: {
            placeholder: "Name your story."
        }
    },
    productId: {
        type: String,
        autoform: {
            omit: true
        },
        denyUpdate: true
    },
    sprintId: {
        type: String,
        autoform: {
            omit: true
        },
        optional: true
    },
    userId: {
        type: String,
        autoValue: function () {
            if (this.isInsert) {
                if (!this.isFromTrustedCode) {
                    return this.userId;
                }
            } else
            /* Prevent user from supplying their own user ID. */
                this.unset();
        },
        denyUpdate: true,
        autoform: {
            omit: true
        }
    },
    lastEditedBy: {
        type: String,
        autoValue: function () {
            if (this.isUpdate) {
                return this.userId;
            } else
            /* Prevent user from supplying their own user ID. */
                this.unset();
        },
        denyInsert: true,
        optional: true,
        autoform: {
            omit: true
        }
    },
    description: {
        type: String,
        label: "Description",
        autoform: {
            placeholder: "As a 'role', I want 'goal' so that 'benefit'."
        }
    },
    priority: {
        type: Number,
        label: "Priority",
        optional: true,
        autoform: {
            omit: true
        }
    },
    storyPoints: {
        type: Number,
        label: "Story Points",
        allowedValues: [0.5, 1, 2, 3, 5, 8, 13, 20, 40, 80],
        decimal: true,
        autoform: {
            options: [
                {label: "½", value: 0.5},
                {label: "1", value: 1},
                {label: "2", value: 2},
                {label: "3", value: 3},
                {label: "5", value: 5},
                {label: "8", value: 8},
                {label: "13", value: 13},
                {label: "20", value: 20},
                {label: "40", value: 40},
                {label: "80", value: 80}
            ]
        },
        optional: true
    },
    businessValue: {
        type: Number,
        label: "Business Value",
        min: 1,
        max: 1000,
        optional: true,
        autoform: {
            placeholder: "1-1000"
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
}));