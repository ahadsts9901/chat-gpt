// taking api key

async function getUserInput() {
    const { value: apiKey } = await Swal.fire({
    //   icon: './assets/logo.webp',
      title: 'Enter your API key',
      input: 'text',
      inputPlaceholder: 'Enter your API key...',
      footer: `<div class='column'><p>Don't have an API key ?</p><a href="https://platform.openai.com/account/api-keys"> Get an API key</a></div>`,
      showCancelButton: true,
      confirmButtonColor: "#00A67E",
      cancelButtonColor: "#00A67E"
    });

    // Check if the user provided an API key or clicked Cancel
    if (apiKey) {
      // User entered an API key, do something with it
      console.log('API Key:', apiKey);
    } else {
      // User clicked Cancel or closed the dialog
      console.log('No API key entered.');
    }
  }

  // Call the function to display the dialog and get user input
  getUserInput();

//   code starts

let chatInput = document.querySelector("#chat-input");
let sendButton = document.querySelector("#send-btn");
let chatContainer = document.querySelector(".chat-container");
let themeButton = document.querySelector("#theme-btn");
let deleteButton = document.querySelector("#delete-btn");

let userText = null;
let API_KEY = "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";

let loadDataFromLocalstorage = () => {
    // Load saved chats and theme from local storage and apply/add on the page
    let themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    let defaultText =   `<div class="default-text">
                            <h1>ChatGPT Clone</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.</p>
                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
}

let createChatElement = (content, className) => {
    // Create new div and apply chat, specified class and set html content of div
    let chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv; // Return the created chat div
}

let getChatResponse = async(incomingChatDiv) => {
    let API_URL = "https://api.openai.com/v1/completions";
    let pElement = document.createElement("p");

    // Define the properties and data for the API request
    let requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        })
    }

    // Send POST request to API, get response and set the reponse as paragraph element text
    try {
        let response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch (error) { // Add error class to the paragraph element and set error text
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    // Remove the typing animation, append the paragraph element and save the chats to local storage
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

let copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    let reponseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

let showTypingAnimation = () => {
    // Display the typing animation and call the getChatResponse function
    let html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="./assets/logo.webp">
                        
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    // Create an incoming chat div with typing animation and append it to chat container
    let incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

let handleOutgoingChat = () => {
    userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
    if (!userText) return; // If chatInput is empty return from here

    // Clear the input field and reset its height
    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    let html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="./assets/person-fill.svg" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    // Create an outgoing chat div with user's message and append it to chat container
    let outgoingChatDiv = createChatElement(html, "outgoing");
    let defaultTextElement = chatContainer.querySelector(".default-text");
    if (defaultTextElement) {
        defaultTextElement.remove();
    }
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalstorage function
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    // Toggle body's class for the theme mode and save the updated theme to the local storage 
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

let initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If the Enter key is pressed without Shift and the window width is larger 
    // than 800 pixels, handle the outgoing chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);