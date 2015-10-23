startPDFExportingProcess = function () {
    var doc = new jsPDF('p', 'mm', 'a4'),
        a4W = 210,
        a4H = 297,
        storyX = 0,
        storyY = 0,
        storyW = 0,
        storyH = (a4H / 4),
        taskX,
        taskY,
        taskW,
        taskH = (storyH / 2),
        more4less,
        addNewPage,
        j,
        userStoriesArr,
        taskArr,
        i,
        userStoryMarkX,
        userStoryMarkY,
        userStoryTitleX,
        userStoryTitleY,
        userStorySubmittedX,
        userStorySubmittedY,
        userStoryAuthorX,
        userStoryAuthorY,
        userStoryPriorityX,
        userStoryPriorityY,
        userStoryBusinessValueX,
        userStoryBusinessValueY,
        userStoryEstimationX,
        userStoryEstimationY,
        userStoryDescriptionX,
        userStoryDescriptionY,
        prio,
        busval,
        esti,
        userStoriesOnLastPage,
        spaceForTasksOnPage,
        taskUserLineX,
        taskUserLineY,
        taskUserLineEnd,
        taskMarkX,
        taskMarkY,
        taskTitleX,
        taskTitleY,
        taskEffortX,
        taskEffortY,
        taskAssignedToX,
        taskAssignedToY,
        assignee,
        assigneeUsername,
        lineColor,
        rgbColor,
        effort,
        storyTitleText,
        storyDescriptionText,
        taskTitleText,
        cutLen;

    // is more than 4 User Stories & less than 4 User Stories in one column
    more4less = false;

    addNewPage = false;
    j = 0;

    doc.setLineWidth(0.1);

    userStoriesArr = UserStories.find().fetch();
    taskArr = Stickies.find().fetch();

    // Draw user stories
    for (i = 0; i < userStoriesArr.length; i++) {

        if (addNewPage) {
            doc.addPage();
            addNewPage = false;
            more4less = false;
            j = 0;
        }
        if (j == 0 || i == 0) {
            storyX = 0;
            storyY = 0;
            storyW = 0;

            userStoryMarkX = 93;
            userStoryMarkY = 5;
            userStoryTitleX = 10;
            userStoryTitleY = 15;
            userStorySubmittedX = 10;
            userStorySubmittedY = 25;
            userStoryAuthorX = 10;
            userStoryAuthorY = 30;
            userStoryPriorityX = 10;
            userStoryPriorityY = 35;
            userStoryBusinessValueX = 10;
            userStoryBusinessValueY = 40;
            userStoryEstimationX = 10;
            userStoryEstimationY = 45;
            userStoryDescriptionX = 10;
            userStoryDescriptionY = 50;
        }

        storyW = (a4W / 2);

        if (j > 3) { // more than 4 user stories -> shift to right
            storyX = (a4W / 2);
            storyW = a4W;
            userStoryMarkX = (a4W - 12);
            userStoryTitleX = (storyX + 10);
            userStorySubmittedX = (storyX + 10);
            userStoryAuthorX = (storyX + 10);
            userStoryPriorityX = (storyX + 10);
            userStoryBusinessValueX = (storyX + 10);
            userStoryEstimationX = (storyX + 10);
            userStoryDescriptionX = (storyX + 10);
            if (storyY >= 222.75) { // more than 4 user stories in one column -> reset Y and start on top
                storyY = 0;
                userStoryMarkY = 5;
                userStoryTitleY = 15;
                userStorySubmittedY = 25;
                userStoryAuthorY = 30;
                userStoryPriorityY = 35;
                userStoryBusinessValueY = 40;
                userStoryEstimationY = 45;
                userStoryDescriptionY = 50;
            } else {
                more4less = true;
            }
        }

        if ((j != 0 && j < 4) || more4less) { // less than 4 user stories in one colum
            storyY += a4H / 4;
            userStoryMarkY = storyY + 5;
            userStoryTitleY = storyY + 15;
            userStorySubmittedY = storyY + 25;
            userStoryAuthorY = storyY + 30;
            userStoryPriorityY = storyY + 35;
            userStoryBusinessValueY = storyY + 40;
            userStoryEstimationY = storyY + 45;
            userStoryDescriptionY = storyY + 50;
        }

        if (!addNewPage) j++;

        doc.rect(storyX, storyY, storyW, storyH);

        // User story mark
        doc.setFontSize(5);
        doc.setFontStyle("normal");
        doc.text(userStoryMarkX, userStoryMarkY, "User story");

        // User story title
        doc.setFontSize(20);
        doc.setFontStyle("bold");
        storyTitleText = userStoriesArr[i].title;
        if (storyTitleText.length > 20) {
            cutLen = storyTitleText.length - 20;
            storyTitleText = storyTitleText.slice(0, -cutLen) + '...';
        }
        doc.text(userStoryTitleX, userStoryTitleY, storyTitleText);

        // User story submitted
        doc.setFontSize(10);
        doc.setFontStyle("bold");
        doc.text(userStorySubmittedX, userStorySubmittedY, "Submitted:");
        doc.setFontStyle("normal");
        doc.text((userStorySubmittedX + 19), userStorySubmittedY, moment(userStoriesArr[i].submitted).format("L"));

        // User story author
        doc.setFontSize(10);
        doc.setFontStyle("bold");
        doc.text(userStoryAuthorX, userStoryAuthorY, "Author:");
        doc.setFontStyle("normal");
        let author = Users.findOne({_id: userStoriesArr[i].userId});
        doc.text(userStoryAuthorX + 14, userStoryAuthorY, author.username);

        // User story priority
        doc.setFontSize(10);
        doc.setFontStyle("bold");
        doc.text(userStoryPriorityX, userStoryPriorityY, "Priority:");
        doc.setFontStyle("normal");
        prio = (!_.isEmpty(userStoriesArr[i].priority)) ? userStoriesArr[i].priority : "-";
        doc.text(userStoryPriorityX + 14, userStoryPriorityY, prio);

        // User story business value
        doc.setFontSize(10);
        doc.setFontStyle("bold");
        doc.text(userStoryBusinessValueX, userStoryBusinessValueY, "Business value:");
        doc.setFontStyle("normal");
        busval = (!_.isEmpty(userStoriesArr[i].businessValue)) ? userStoriesArr[i].businessValue : "-";
        doc.text(userStoryBusinessValueX + 28, userStoryBusinessValueY, busval);

        // User story estimation
        doc.setFontSize(10);
        doc.setFontStyle("bold");
        doc.text(userStoryEstimationX, userStoryEstimationY, "Estimation:");
        doc.setFontStyle("normal");
        esti = (!_.isEmpty(userStoriesArr[i].storyPoints)) ? userStoriesArr[i].storyPoints : "-";
        doc.text(userStoryEstimationX + 20, userStoryEstimationY, esti);

        // User story description
        doc.setFontSize(10);
        doc.setFontStyle("bold");
        doc.text(userStoryDescriptionX, userStoryDescriptionY, "Description:");
        doc.setFontStyle("normal");
        storyDescriptionText = userStoriesArr[i].description;
        if (storyDescriptionText.length > 40) {
            cutLen = storyDescriptionText.length - 40;
            storyDescriptionText = storyDescriptionText.slice(0, -cutLen) + '...';
        }
        doc.text(userStoryDescriptionX, userStoryDescriptionY + 5, storyDescriptionText);

        if ((i + 1) % 8 == 0) {
            addNewPage = true;
        }
    }

    // Position from last user story rect is basis for first task rect
    taskX = storyX;
    taskY = (storyY + storyH);
    taskW = storyW;
    // Check if user story is last element on A4 page
    if (taskX === (a4W / 2) && taskY === a4H) {
        // Place first task on new page
        doc.addPage();
        taskX = 0;
        taskY = 0;
        taskW = (a4W / 2);
    }
    userStoriesOnLastPage = j;
    spaceForTasksOnPage = ((8 - userStoriesOnLastPage) * 2);
    j = 0;
    taskUserLineX = 0;
    taskUserLineY = 0;
    taskUserLineEnd = 0;
    taskMarkX = 0;
    taskMarkY = 0;
    taskTitleX = 0;
    taskTitleY = 0;
    taskEffortX = 0;
    taskEffortY = 0;
    taskAssignedToX = 0;
    taskAssignedToY = 0;

    // Draw tasks
    for (i = 0; i < taskArr.length; i++) {
        if (i != 0) {
            if (addNewPage) addNewPage = false;
            if (taskY >= 259.875 && spaceForTasksOnPage > j) { // more than 8 tasks in one column -> reset Y and start on top
                taskY = 0;
                taskX = taskW;
            } else {
                if (spaceForTasksOnPage >= j) {
                    taskY += taskH;
                } else {
                    addNewPage = true;
                    doc.addPage();
                    spaceForTasksOnPage = 16;
                    j = 0;
                    taskX = 0;
                    taskY = 0;
                    taskW = (a4W / 2);
                }
            }
        }

        if (!addNewPage) j++;

        doc.rect(taskX, taskY, taskW, taskH);

        // Task user line
        taskUserLineX = taskX + 15;
        taskUserLineY = taskY + 4;
        taskUserLineEnd = taskX + 90;

        assignee = Users.findOne({_id: taskArr[i].assigneeId});
        assigneeUsername = "nobody";
        lineColor = "#000000";

        if (assignee) {
            lineColor = assignee.profile.color;
            assigneeUsername = assignee.username;
        }

        rgbColor = hexToRgb(lineColor);
        doc.setDrawColor(rgbColor.red, rgbColor.green, rgbColor.blue);
        doc.setLineWidth(2);
        doc.line(taskUserLineX, taskUserLineY, taskUserLineEnd, taskUserLineY);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);

        // Task mark
        taskMarkX = taskX == 0 ? ((a4W / 2) - 7) : (a4W - 7);
        taskMarkY = taskY + 5;
        doc.setFontSize(5);
        doc.text(taskMarkX, taskMarkY, "Task");

        // Task title
        taskTitleX = taskX + 15;
        taskTitleY = taskY + 15;
        doc.setFontSize(15);
        doc.setFontStyle("bold");
        taskTitleText = taskArr[i].title;
        if (taskTitleText.length > 25) {
            cutLen = taskTitleText.length - 25;
            taskTitleText = taskTitleText.slice(0, -cutLen) + '...';
        }
        doc.text(taskTitleX, taskTitleY, taskTitleText);
        doc.setFontStyle("normal");

        // Task effort
        taskEffortX = taskX + 15;
        taskEffortY = taskY + 25;
        doc.setFontSize(10);
        doc.setFontStyle("bold");
        doc.text(taskEffortX, taskEffortY, "Effort in h:");
        doc.setFontStyle("normal");
        effort = String(taskArr[i].effort);
        doc.text(taskEffortX + 19, taskEffortY, effort);

        // Task assigned to
        taskAssignedToX = taskX + 15;
        taskAssignedToY = taskY + 30;
        doc.setFontSize(10);
        doc.setFontStyle("bold");
        doc.text(taskAssignedToX, taskAssignedToY, "Assigned to:");
        doc.setFontStyle("normal");
        doc.text(taskAssignedToX + 22, taskAssignedToY, assigneeUsername);
    }
    doc.save("ScrumpyExport.pdf");
};

// see: http://stackoverflow.com/a/5624139/3475602
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
    } : null;
}