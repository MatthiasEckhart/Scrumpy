// @hoangdov - https://github.com/particle4dev/upload-avatar-meteor

DEFAULTAVATAR = "/images/default_avatar.jpg";
FILEUPLOAD = {
    IMG: {TYPE: ["image/jpeg", "image/png"], MAXSIZE: 512000},
    DOC: []
};

var x, y, width, height, saveAvatarButton, realImage, displayImage;
var widthAvatar = 128, heightAvatar = 128, maxWidthImage = 300, maxHeightImage = 300;

Template.editAvatar.helpers({
    image: function () {
        if (Meteor.user() && Meteor.user().profile.image.length != 0) {
            return Meteor.user().profile.image;
        }
        return DEFAULTAVATAR;
    },
    disabledSaveAvatarButton: function () {
        if (Session.equals('removeAvatar', true) || Session.equals('changeAvatar', true)) {
            return "";
        }
        return "disabled";
    },
    removeAvatar: function () {
        return Session.equals('removeAvatar', true);
    },
    changeAvatar: function () {
        return Session.equals('changeAvatar', true);
    }
});

Template.editAvatar.onRendered(function () {
    saveAvatarButton = $('#save-avatar-button');
    realImage = this.find('#real-img');
    displayImage = $('#avatar-img');
    Session.set('removeAvatar', false);
    Session.set('changeAvatar', false);
});

Template.editAvatar.events({
    "change input[name=image-upload]": function (e, t) {
        e.preventDefault();
        var inputImgUpload = t.find('input[name=image-upload]');
        if (inputImgUpload.files && inputImgUpload.files[0]) {
            FileReaderObj.prev(inputImgUpload.files[0], function (err, file) {
                if (err) {
                    throwAlert('error', 'Sorry!', err.message);
                } else {
                    loadImage(t, file.result);
                    $(function () {
                        displayImage.imgAreaSelect({
                            aspectRatio: '1:1',
                            handles: true,
                            fadeSpeed: 200,
                            parent: $('#row-img'),
                            x1: 0,
                            y1: 0,
                            x2: widthAvatar,
                            y2: heightAvatar,
                            onInit: preview,
                            onSelectChange: preview
                        });
                    });
                }
            });
        }
    },
    'click #change-avatar': function (e, t) {
        e.preventDefault();
        t.find('input[name=image-upload]').click();
    },
    'click #remove-avatar': function (e) {
        e.preventDefault();
        Session.set('removeAvatar', true);
    },
    'click #save-avatar-button': function (e) {
        e.preventDefault();
        if (Session.equals('removeAvatar', true)) {
            Meteor.call('setDefaultAvatar', Meteor.userId(), function (err) {
                if (err) {
                    throwAlert('error', 'Sorry!', err.message);
                }
            });
        } else {
            changeAvatar();
        }
        Router.go('dashboard');
        displaySuccessAlertForAvatarChanged();
        Session.set('removeAvatar', false);
        Session.set('changeAvatar', false);
    }
});

var changeAvatar = function () {
    var canvas = document.createElement("canvas"), scaleX, scaleY, context;
    canvas.width = widthAvatar;
    canvas.height = heightAvatar;
    scaleX = realImage.width / displayImage.width();
    scaleY = realImage.height / displayImage.height();
    context = canvas.getContext("2d");
    // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
    context.drawImage(realImage, x * scaleX, y * scaleY, width * scaleX, height * scaleY, 0, 0, widthAvatar, heightAvatar);
    Meteor.call('updateAvatar', canvas.toDataURL(), function (err) {
        if (err) {
            throwAlert('error', 'Sorry!', err.message);
        } else {
            close();
        }
    });
};

function preview(img, selection) {
    if (!selection.width || !selection.height) {
        return;
    }
    var scaleX = widthAvatar / selection.width,
        scaleY = heightAvatar / selection.height;
    $('#preview img').css({
        width: Math.round(scaleX * img.width),
        height: Math.round(scaleY * img.height),
        marginLeft: -Math.round(scaleX * selection.x1),
        marginTop: -Math.round(scaleY * selection.y1)
    });
    x = selection.x1;
    y = selection.y1;
    width = selection.width;
    height = selection.height;
    if (Session.equals('changeAvatar', false)) {
        open();
    }
}
function loadImage(tmp, src) {
    var img = new Image(), imgWidthHeight;
    img.onload = function () {
        imgWidthHeight = calculateAspectRatioFit(this.width, this.height, maxWidthImage, maxHeightImage);
        $(tmp.find('#avatar-img')).attr('src', src).attr('width', imgWidthHeight.width).attr('height', imgWidthHeight.height);
    };
    img.src = src;
    $(tmp.find('#preview img')).attr('src', src);
    $(tmp.find('#real-img')).attr('src', src);
}
function open() {
    Session.set('changeAvatar', true);
    $('#preview-frame').removeClass('hide');
}

function close() {
    Session.set('changeAvatar', false);
    $('#preview-frame').addClass('hide');
    displayImage.removeAttr('width').removeAttr('height');
    displayImage.imgAreaSelect({remove: true});
}

// http://stackoverflow.com/a/14731922/3475602
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {width: srcWidth * ratio, height: srcHeight * ratio};
}

function displaySuccessAlertForAvatarChanged() {
    throwAlert('success', 'Yippie!', 'Avatar successfully updated!');
}

FileReaderObj = {
    prev: function (file, callback) {
        var reader = new FileReader();
        reader.onload = function (e) {
            if (!_.contains(FILEUPLOAD.IMG.TYPE, file.type)) {
                callback(new Meteor.Error(412, "This file format is not supported. Please upload a .jpg or .png image."));
                return;
            }
            if (file.size > FILEUPLOAD.IMG.MAXSIZE) {
                callback(new Meteor.Error(412, "This file is too large. Size limit is 512kb."));
                return;
            }
            file.result = e.target.result;
            callback(null, file);
        };
        reader.onerror = function () {
            callback(reader.error);
        };
        reader.readAsDataURL(file);
    }
};