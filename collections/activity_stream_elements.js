ActivityStreamElements = new Mongo.Collection('activityStreamElements');

ActivityStreamElements.deny({
    insert: denyPermission,
    update: denyPermission,
    remove: denyPermission
});

ActivityStreamElements.attachSchema(new SimpleSchema({
    /* Type is a mandatory attribute, since it is used as an identifier. */
    type: {
        type: Number,
        autoform: {
            omit: true
        }
    },
    userId: {
        type: String,
        denyUpdate: true,
        autoform: {
            omit: true
        }
    },
    /* Product attributes */
    productId: {
        type: String,
        denyUpdate: true,
        autoform: {
            omit: true
        }
    },
    productTitle: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    newProductTitle: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    oldProductTitle: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    /* Sprint attributes */
    sprintGoal: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    sprintStartDate: {
        type: Date,
        optional: true,
        autoform: {
            omit: true
        }
    },
    sprintEndDate: {
        type: Date,
        optional: true,
        autoform: {
            omit: true
        }
    },
    oldSprintGoal: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    newSprintGoal: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    oldSprintStartDate: {
        type: Date,
        optional: true,
        autoform: {
            omit: true
        }
    },
    newSprintStartDate: {
        type: Date,
        optional: true,
        autoform: {
            omit: true
        }
    },
    oldSprintEndDate: {
        type: Date,
        optional: true,
        autoform: {
            omit: true
        }
    },
    newSprintEndDate: {
        type: Date,
        optional: true,
        autoform: {
            omit: true
        }
    },
    /* User Story attributes */
    priority: {
        type: Number,
        optional: true,
        autoform: {
            omit: true
        }
    },
    userStoryTitle: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    oldUserStoryTitle: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    newUserStoryTitle: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    oldUserStoryDescription: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    newUserStoryDescription: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    /* Sticky attributes */
    stickyTitle: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    oldStickyStatus: {
        type: Number,
        optional: true,
        autoform: {
            omit: true
        }
    },
    newStickyStatus: {
        type: Number,
        optional: true,
        autoform: {
            omit: true
        }
    },
    oldStickyTitle: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    newStickyTitle: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    oldStickyDescription: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    newStickyDescription: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    oldEffort: {
        type: Number,
        optional: true,
        autoform: {
            omit: true
        }
    },
    newEffort: {
        type: Number,
        optional: true,
        autoform: {
            omit: true
        }
    },
    /* Invitation attributes */
    role: {
        type: Number,
        optional: true,
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
            if (this.isUpdate) {
                return new Date();
            }
        },
        denyInsert: true,
        optional: true,
        autoform: {
            omit: true
        }
    }
}));