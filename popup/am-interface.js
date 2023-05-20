// Declare a global variable to hold the document title
let pageTitle = "";
let received_data = null;

// Fetch activity from the API
async function fetchChatCompletion(prompt) {
try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <OPENAI_KEY>'
    },
    body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
        { role: 'user', content: prompt }
        ],
        temperature: 0.7
    })
    });

    if (!response.ok) {
    throw new Error('API request failed');
    }

    const data = await response.json();
    console.log(`${JSON.stringify(data)}`);
    // browser.storage.local.set({ completion: data.choices[0].message.content });
    received_data = data.choices[0].message.content;

    return received_data;
    // Handle the response data
} catch (error) {
    console.error('Error:', error);
}
}

function handleMessage(request, sender, sendResponse) {
  console.log(`A content script sent a message with title: ${request.title}`);

  // Assign the document title to the global variable
  pageTitle = request.title;

  // Find the pageTitle div element in am-interface.html
  const pageTitleElement = document.getElementById("pageTitle");

  if (pageTitleElement) {
    // Set the document title as the inner text of the pageTitle div
    pageTitleElement.innerHTML = pageTitle;
  }

  browser.storage.local.set({ pageTitle: request.title });

  const userText = "What can you say about someone watching this video? Frame it as: 'You must be...'. Write a single sentence.";
  const prompt = `${pageTitle}\n\n${userText}`;
  
  fetchChatCompletion(prompt).then(function(received_gpt){
    sendResponse({ response: "Response from background script", title: pageTitle, completion: received_gpt });
  });

  // Return true to indicate that the response will be sent asynchronously
  return true;
}

browser.runtime.onMessage.addListener(handleMessage);

// Function to update the pageTitle div with the document title
function updatePageTitle(title) {
  document.getElementById("pageTitle").innerText = title;
}

browser.storage.local.get("pageTitle").then(function (data) {
  const storedTitle = data.pageTitle;
  if (storedTitle) {
    updatePageTitle(storedTitle);
  }
});

// Function to update the pageActivity div with the activity
function updatePageActivity(activity) {
  document.getElementById("pageActivity").innerText = activity;
}

// Function to retrieve the stored activity from browser.storage
function displayStoredActivity() {
  browser.storage.local.get("activity").then(function (data) {
    const storedActivity = data.activity;
    if (storedActivity) {
      updatePageActivity(storedActivity);
    }
  });
}

// Add event listener to the fetchButton
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("fetchButton").addEventListener("click", function () {
    // Call fetchAndStoreActivity to trigger API call and store the activity
    fetchAndStoreActivity(displayStoredActivity);
  });
});

// Function to fetch activity from the API and store it in browser.storage.local
function fetchAndStoreActivity(callback) {
  fetch('http://www.boredapi.com/api/activity/')
    .then(function(response) {
      if (!response.ok) {
        throw new Error('API request failed');
      }
      return response.json();
    })
    .then(function(data) {
      // Store the fetched activity in browser.storage.local
      browser.storage.local.set({ activity: data.activity })
        .then(function () {
          console.log('Activity stored in browser.storage.local');
          if (callback && typeof callback === 'function') {
            callback();
          }
        });
    })
    .catch(function(error) {
      console.error('Error:', error);
    });
}

// Add event listener to the displayButton
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("displayButton").addEventListener("click", displayStoredActivity);
});
