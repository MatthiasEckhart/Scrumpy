getProduct = function (productId) {
    let product = Products.findOne({_id: productId});
    if (!product) throw new Meteor.Error(500, "Product not found.", "Please contact support team.");
    return product;
};

getUserStory = function (userStoryId) {
    let userStory = UserStories.findOne({_id: userStoryId});
    if (!userStory) throw new Meteor.Error(500, "User Story not found.", "Please contact support team.");
    return userStory;
};
