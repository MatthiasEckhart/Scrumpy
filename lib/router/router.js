/* Set global default options for router. */
Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading',
    /* Disable spinner. */
    progressSpinner: false,
    waitOn: function () {
        /* Check if user and corresponding notifications are ready. */
        if (Meteor.user() && Meteor.user().notifications)
            return [
                Meteor.subscribe('notifications', Meteor.user().notifications),
                Meteor.subscribe('productInvitationData', Meteor.userId()),
                Meteor.subscribe('usersInvitationAuthors', Meteor.userId()),
                Meteor.subscribe('allRecipientsAvatarsInvolved', Meteor.userId())
            ];
    }
});

/* Dashboard Route Controller. */
DashboardController = RouteController.extend({
    template: 'dashboard',
    /* Show the first ten projects. */
    increment: 10,
    /* Set product ids. */
    productIds: function () {
        /* Check if user and user roles are ready. */
        if (Meteor.user() && Meteor.user().roles) {
            /* User roles are named after product ids, as a consequence we can return an array of role names, queried by all different roles groups. */
            return _.union(Meteor.user().roles.administrator, Meteor.user().roles.developmentTeam, Meteor.user().roles.productOwner, Meteor.user().roles.scrumMaster).filter(function (e) {
                return e;
            });
        } else return [];
    },
    /* Limit the amount of products displayed at once (infinite pagination). */
    limit: function () {
        return parseInt(this.params.productsLimit, 10) || this.increment;
    },
    /* Sort products by updatedAt time stamp. */
    findOptions: function () {
        return {sort: {updatedAt: -1}, limit: this.limit()};
    },
    waitOn: function () {
        if (this.productIds())
            return [
                Meteor.subscribe('dashboardStatisticsPrivateByProductUserId'),
                Meteor.subscribe('dashboardStatisticsPrivateByInvitation'),
                Meteor.subscribe('products', this.findOptions(), this.productIds()),
                Meteor.subscribe('tasksCompletedByInvitation'),
                Meteor.subscribe('tasksCompletedByProductUserId'),
                Meteor.subscribe('usersInvitationAcceptedAuthors', Meteor.userId()),
                Meteor.subscribe('usernames'),
                Meteor.subscribe('recentConversations', Meteor.userId()),
                Meteor.subscribe('invitations', Meteor.userId()),
                Meteor.subscribe('productInvitationData', Meteor.userId()),
                Meteor.subscribe('usersInvitationAuthors', Meteor.userId())
            ];
    },
    products: function () {
        /* If product IDs and user is ready, return cursor with products documents. */
        if (this.productIds()) return Products.find({_id: {$in: this.productIds()}}, this.findOptions());
    },
    data: function () {
        return {
            products: this.products(),
            nextPath: () => {
                if (this.productIds().length > this.limit())
                    return this.route.path({productsLimit: this.limit() + this.increment});
            }
        };
    }
});

ProductDashboardController = RouteController.extend({
    layoutTemplate: "productPageLayout",
    template: "productDashboard",
    /* Show the first ten activity stream elements. */
    increment: 5,
    /* Limit the amount of activity stream elements displayed at once (infinite pagination). */
    limit: function () {
        return parseInt(this.params.activityStreamElementsLimit, 10) || this.increment;
    },
    /* Sort activity stream elements by updatedAt time stamp. */
    findOptions: function () {
        return {sort: {updatedAt: -1}, limit: this.limit()};
    },
    onBeforeAction: [scrumTeamFilter, productAdvancedFilter],
    activityStreamElements: function () {
        let product = Products.findOne({slug: this.params.slug});
        if (product) return ActivityStreamElements.find({productId: product._id}, this.findOptions());
    },
    product: function () {
        return Products.findOne({slug: this.params.slug});
    },
    data: function () {
        return {
            product: this.product(),
            activityStreamElements: this.activityStreamElements(),
            nextPath: () => {
                if (this.activityStreamElements().count() === this.limit())
                    return this.route.path({
                        slug: this.params.slug,
                        activityStreamElementsLimit: this.limit() + this.increment
                    });
            }
        };
    },
    waitOn: function () {
        return [
            Meteor.subscribe('singleProduct', this.params.slug),
            Meteor.subscribe('userStoriesBasic', this.params.slug),
            Meteor.subscribe('sprints', this.params.slug),
            Meteor.subscribe('burndown', this.params.slug),
            Meteor.subscribe('comments', this.params.slug),
            Meteor.subscribe('usersInvited', this.params.slug),
            Meteor.subscribe('userProductAuthor', this.params.slug),
            Meteor.subscribe('stickiesByProductSlug', this.params.slug),
            Meteor.subscribe('activityStreamElements', this.params.slug),
            Meteor.subscribe('productInvitations', this.params.slug)
        ];
    },
    action: function () {
        this.render();
        this.render("navigationSidebar", {to: "navigationSidebar"});
        this.render("productPageIncludes", {to: "productPageIncludes"});
    }
});

SprintPlanningController = RouteController.extend({
    layoutTemplate: "productPageLayout",
    template: "sprintPlanning",
    onBeforeAction: [scrumTeamFilter, productAdvancedFilter],
    data: function () {
        return {product: Products.findOne({slug: this.params.slug})};
    },
    waitOn: function () {
        return [
            Meteor.subscribe('singleProduct', this.params.slug),
            Meteor.subscribe('userStoriesBasic', this.params.slug),
            Meteor.subscribe('sprints', this.params.slug),
            Meteor.subscribe('burndown', this.params.slug),
            Meteor.subscribe('comments', this.params.slug),
            Meteor.subscribe('usersInvited', this.params.slug),
            Meteor.subscribe('userProductAuthor', this.params.slug),
            Meteor.subscribe('stickiesByProductSlug', this.params.slug),
            Meteor.subscribe('productInvitations', this.params.slug)
        ];
    },
    action: function () {
        this.render();
        this.render("navigationSidebar", {to: "navigationSidebar"});
        this.render("productPageIncludes", {to: "productPageIncludes"});
    }
});

DocumentsController = RouteController.extend({
    layoutTemplate: "productPageLayout",
    template: "documents",
    onBeforeAction: [scrumTeamFilter, productAdvancedFilter],
    data: function () {
        return {product: Products.findOne({slug: this.params.slug})};
    },
    waitOn: function () {
        return [
            Meteor.subscribe('singleProduct', this.params.slug),
            Meteor.subscribe('documents', this.params.slug),
            Meteor.subscribe('sprints', this.params.slug),
            Meteor.subscribe('productInvitations', this.params.slug)
        ];
    },
    action: function () {
        this.render();
        this.render("navigationSidebar", {to: "navigationSidebar"});
        this.render("productPageIncludes", {to: "productPageIncludes"});
    }
});

ProductEditController = RouteController.extend({
    layoutTemplate: "productPageLayout",
    template: "productEdit",
    onBeforeAction: [productOwnerAdminFilter],
    waitOn: function () {
        return [
            Meteor.subscribe('singleProduct', this.params.slug),
            Meteor.subscribe('productInvitations', this.params.slug)
        ];
    },
    data: function () {
        return {product: Products.findOne({slug: this.params.slug})};
    },
    action: function () {
        this.render();
        this.render("navigationSidebar", {to: "navigationSidebar"});
        this.render("productPageIncludes", {to: "productPageIncludes"});
    }
});

ProductInvitationsController = RouteController.extend({
    layoutTemplate: "productPageLayout",
    template: "productInvitations",
    onBeforeAction: [productOwnerAdminFilter],
    waitOn: function () {
        return [
            Meteor.subscribe('usernamesRoles'),
            Meteor.subscribe('singleProduct', this.params.slug),
            Meteor.subscribe('productInvitations', this.params.slug),
            Meteor.subscribe('usersInvitationRecipient', this.params.slug)
        ];
    },
    data: function () {
        return {product: Products.findOne({slug: this.params.slug})};
    },
    action: function () {
        this.render();
        this.render("navigationSidebar", {to: "navigationSidebar"});
        this.render("productPageIncludes", {to: "productPageIncludes"});
    }
});

InviteController = RouteController.extend({
    layoutTemplate: "productPageLayout",
    template: "invite",
    onBeforeAction: [productOwnerAdminFilter],
    waitOn: function () {
        return [
            Meteor.subscribe('usernamesRoles'),
            Meteor.subscribe('singleProduct', this.params.slug),
            Meteor.subscribe('productInvitations', this.params.slug),
            Meteor.subscribe('usersInvitationRecipient', this.params.slug)
        ];
    },
    data: function () {
        return {product: Products.findOne({slug: this.params.slug})};
    },
    action: function () {
        this.render();
        this.render("navigationSidebar", {to: "navigationSidebar"});
        this.render("productPageIncludes", {to: "productPageIncludes"});
    }
});

Router.route('/product/:slug/dashboard/:activityStreamElementsLimit?', {
    name: 'productDashboard',
    controller: ProductDashboardController
});

Router.route('/product/:slug/sprint-planning', {
    name: 'sprintPlanning',
    controller: SprintPlanningController
});

Router.route('/product/:slug/documents', {
    name: 'documents',
    controller: DocumentsController
});

Router.route('/product/:slug/edit', {
    name: 'productEdit',
    controller: ProductEditController
});

Router.route('/product/:slug/invitations', {
    name: 'productInvitations',
    controller: ProductInvitationsController
});

Router.route('/product/:slug/invite', {
    name: 'invite',
    controller: InviteController
});

Router.route('/dashboard/:productsLimit?', {
    name: 'dashboard',
    controller: DashboardController
});

Router.route('/register', function () {
    this.render('register');
}, {name: 'register', disableProgress: true});

Router.route('/login', function () {
    this.render('login');
}, {name: 'login', disableProgress: true});

Router.route('/task-board/:slug/:startDate?/:endDate?', {
    name: 'taskBoardPage',
    template: 'taskBoardPage',
    onBeforeAction: [scrumTeamFilter, taskBoardPageFilter],
    data: function () {
        return Products.findOne({slug: this.params.slug});
    },
    waitOn: function () {
        if (this.params.startDate && this.params.endDate) {
            return [
                Meteor.subscribe('singleProduct', this.params.slug),
                Meteor.subscribe('usersInvited', this.params.slug),
                Meteor.subscribe('userProductAuthor', this.params.slug),
                Meteor.subscribe('sprints', this.params.slug),
                Meteor.subscribe('userStoriesAdvanced', this.params.slug,
                    moment.utc(this.params.startDate).toDate(),
                    moment.utc(this.params.endDate).toDate())
            ];
        }
        return [
            Meteor.subscribe('singleProduct', this.params.slug),
            Meteor.subscribe('usersInvited', this.params.slug),
            Meteor.subscribe('userProductAuthor', this.params.slug),
            Meteor.subscribe('userStoriesBasic', this.params.slug),
            Meteor.subscribe('sprints', this.params.slug)
        ];

    }
});

Router.route('/create', function () {
    this.render('productCreate');
}, {name: 'productCreate', disableProgress: true});

Router.route('/profile/:username', {
    name: 'profilePage',
    template: 'profilePage',
    data: function () {
        return Users.findOne({username: this.params.username});
    },
    waitOn: function () {
        return [
            Meteor.subscribe('userProfile', this.params.username),
            Meteor.subscribe('statisticsForProfilePage', this.params.username)
        ];
    }
});

Router.route('/conversations', {
    name: 'conversationsList',
    template: 'conversationsList',
    waitOn: function () {
        return [Meteor.subscribe('conversations', Meteor.userId())];
    }
});

Router.route('/conversations/create', {
    name: 'conversationCreate',
    template: 'conversationCreate',
    waitOn: function () {
        return [Meteor.subscribe('usernames')];
    }
});

Router.route('/conversation/:slug', {
    name: 'conversation',
    template: 'conversation',
    onBeforeAction: recipientsFilter,
    data: function () {
        return Conversations.findOne({slug: this.params.slug});
    },
    waitOn: function () {
        return [
            Meteor.subscribe('conversation', this.params.slug),
            Meteor.subscribe('recipientsAvatars', this.params.slug),
            Meteor.subscribe('privateMessages', this.params.slug)
        ];
    }
});

Router.route('/conversation/:slug/edit', {
    name: 'conversationEdit',
    template: 'conversationEdit',
    onBeforeAction: [conversationAdminFilter],
    data: function () {
        return Conversations.findOne({slug: this.params.slug});
    },
    waitOn: function () {
        return [
            Meteor.subscribe('conversation', this.params.slug),
            Meteor.subscribe('usernames', this.params.slug)
        ];
    }
});

Router.route('/invitations', {
    name: 'invitations',
    template: 'invitations',
    waitOn: function () {
        return [
            Meteor.subscribe('invitations', Meteor.userId()),
            Meteor.subscribe('productInvitationData', Meteor.userId()),
            Meteor.subscribe('usersInvitationAuthors', Meteor.userId())
        ];
    }
});

Router.route('/', {
    name: 'landingPage',
    template: 'landingPage',
    disableProgress: true,
    onBeforeAction: function () {
        if (Meteor.user()) this.redirect('/dashboard');
        else this.next();
    }
});

Router.route('*', function () {
    this.render('notFound');
}, {name: 'notFound'});

Router.onBeforeAction(requireLogin, {
    only: [
        'dashboard',
        'productCreate',
        'productDashboard',
        'productEdit',
        'conversationsList',
        'conversation',
        'conversationCreate',
        'conversationEdit',
        'sprintPlanning',
        'documents',
        'taskBoardPage',
        'profilePage',
        'invitations',
        'invite',
        'productInvitations'
    ]
});

if (Meteor.isClient) Router.onBeforeAction('dataNotFound');