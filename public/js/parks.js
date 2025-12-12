//mark a park as favorite
const showMessageFavoriteParks = (msg, success = true) => {
  const messageDiv = document.getElementById("favorite-park-msg");
  messageDiv.textContent = msg;
  messageDiv.style.display = "block";
}

const showMessageParksVisited = (msg, success = true) => {
  const messageDiv = document.getElementById("parks-visited-msg");
  messageDiv.textContent = msg;
  messageDiv.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".favorite-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const parkId = btn.dataset.id;
      const action = btn.dataset.action === "add" ? "/parks/favorite-park" : "/parks/unfavorite-park";

      try {
        const res = await fetch(`${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parkId })
        });
        const data = await res.json();

        if (data.success) {
          btn.textContent = btn.dataset.action === "add" ? "Remove this Park from my Favorites" : "Add this park to my Favorites";
          btn.dataset.action = btn.dataset.action === "add" ? "remove" : "add";
          showMessageFavoriteParks(data.message);
        } else {
          showMessageFavoriteParks(data.error, false);
        }
      } catch (err) {
        showMessageFavoriteParks("Something went wrong.", false);
      }
    });
  });

  document.querySelectorAll(".parks-visited-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const parkId = btn.dataset.id;
      const action = btn.dataset.action === "add" ? "/parks/visited-park" : "/parks/unvisited-park";

      try {
        const res = await fetch(`${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parkId })
        });
        const data = await res.json();

        if (data.success) {
          btn.textContent = btn.dataset.action === "add" ? "Remove Visited Park" : "Add Visited Park";
          btn.dataset.action = btn.dataset.action === "add" ? "remove" : "add";
          showMessageParksVisited(data.message);
        } else {
          showMessageParksVisited(data.error, false);
        }
      } catch (err) {
        showMessageParksVisited("Something went wrong.", false);
      }
    });
  });
});
