(function() {
    const commentForm = document.getElementById("comment-form");
    const commentTextarea = document.getElementById("comment");
    const commentError = document.getElementById("comment-error");

    if(!commentForm || !commentTextarea || !commentError){
        return;
    }

    commentForm.addEventListener("submit", function (event) {
        commentError.textContent= "";

        const rawText = commentTextarea.value; 
        const trimmedComment = rawText.trim();

        if(trimmedComment.length === 0){
            event.preventDefault();
            commentError.textContent = "Comment is required";
            return;
        }

        if(trimmedComment.length > 500){
            event.preventDefault();
            commentError.textContent = "Comment must be 500 characters or less";
            return;
        }

        if(trimmedComment.indexOf("<") !== -1 || trimmedComment.indexOf(">") !== -1){
            event.preventDefault();
            commentError.textContent = "Comment cannot contain < or >";
            return;
        }
    });
})();