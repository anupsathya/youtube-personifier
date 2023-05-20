function handleResponse(message) {
    setTimeout(function() {
        console.log(`${message.title}`);
        console.log(`${message.completion}`);
      
        // Create a new <div> element for the banner
        const bannerElement = document.createElement("div");
        bannerElement.id = "extensionBanner";
        bannerElement.textContent = message.completion;
      
        // Apply CSS styles to the banner
        bannerElement.style.position = "fixed";
        bannerElement.style.top = "0";
        bannerElement.style.left = "0";
        bannerElement.style.width = "100%";
        bannerElement.style.backgroundColor = "yellow";
        bannerElement.style.padding = "10px";
        bannerElement.style.zIndex = "9999";
      
        // Check if the banner already exists, and remove it if it does
        const existingBanner = document.getElementById("extensionBanner");
        if (existingBanner) {
          existingBanner.remove();
        }
      
        // Add the banner to the top of the webpage
        document.body.insertBefore(bannerElement, document.body.firstChild);
      }, 1000);        

  }
  
  function handleError(error) {
    console.log(`Error(happening here): ${error}`);
  }
  
  function notifyBackgroundPage(e) {
    setTimeout(function () {
      const youtubePlayer = document.querySelector("video.html5-main-video");
      if (youtubePlayer && !youtubePlayer.paused) {
        const pageTitle = document.title;
        const sending = browser.runtime.sendMessage({
          title: pageTitle,
        });
        sending.then(handleResponse, handleError);
      }
    }, 500);
    // The timeout makes sure that the title is loaded fully. Without the timeout, the previous video title ends up being grabbed.
  }

  // Event listeners for new, subsequent video plays and new video clicks on the sidebar
  window.addEventListener("playing", notifyBackgroundPage, true);

  