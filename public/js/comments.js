document.addEventListener("DOMContentLoaded", () => {
    const commentForm = document.getElementById("comment-form");
    const commentTextarea = document.getElementById("comment");
    const commentError = document.getElementById("comment-error");
    const commentList = document.getElementById("comment-list");

    if(!commentForm || !commentTextarea || !commentError){
        return;
    }

    if(commentForm){
        commentForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            commentError.textContent= "";

            const rawText = commentTextarea.value; 
            const trimmedComment = rawText.trim();

            if(trimmedComment.length === 0){
                commentError.textContent = "Comment is required";
                return;
            }

            if(trimmedComment.length > 500){
                commentError.textContent = "Comment must be 500 characters or less";
                return;
            }

            if(trimmedComment.indexOf("<") !== -1 || trimmedComment.indexOf(">") !== -1){
                commentError.textContent = "Comment cannot contain < or >";
                return;
            }

            try {
                const response = await fetch(commentForm.action, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ comment: trimmedComment })
                });

                const data = await response.json();

                if (!response.ok) {
                    commentError.textContent = data.error || "There was an error.";
                    return;
                }

                // clear text area so comment box is empty again
                commentTextarea.value = "";

                // send comment to DOM so it appears at top
                commentList.insertAdjacentHTML("afterbegin", data.commentHtml);

            } catch (err) {
                commentError.textContent = "An error occured, please try again.";
            }
        });
    }

    if(commentList){
        commentList.addEventListener("click", async (e) => {
            const target = e.target;
            const div = target.closest(".comment-item");
            if (!div) return;
            const commentId = div.dataset.commentId;

            if (target.classList.contains("comment-delete-button")) {
                try {
                    const parkId = commentList.dataset.parkId;
                    const res = await fetch(`/parks/comments/${commentId}/delete`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ parkId }),
                    });
                    if (!res.ok) {
                        throw new Error("Delete failed");
                    }
                    const data = await res.json();
                    if (data.success) div.remove();
                } catch (error) {
                    alert(error.toString() || "Failed to delete comment");
                }
            }

            if (target.classList.contains("comment-like-button")) {
                try {
                    const parkId = commentList.dataset.parkId;
                    const res = await fetch(`/parks/comments/${commentId}/like`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ parkId }),
                        });
                    if (!res.ok) {
                        throw new Error("Delete failed");
                    }
                    const data = await res.json();
                    if (data.success) {
                        target.querySelector(".like-count").textContent = data.likes.likes || 0;
                    }
                } catch (error) {
                    alert(error.toString() || "Failed to like comment");
                }
            }
        });
    }
});