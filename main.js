let API_KEY = null;

const apiKeySwal = () => {
    Swal.fire({
        title: 'Enter your API key',
        input: 'text',
        inputPlaceholder: 'Enter your API key...',
        footer: `<div class='column'><p>Don't have an API key ?</p><a target="_blank" href="https://platform.openai.com/account/api-keys"> Get an API key</a></div>`,
        showCancelButton: true,
        confirmButtonColor: "#343541",
        cancelButtonColor: "#343541",
        preConfirm: (inputValue) => {
            if (inputValue === "") {
                Swal.showValidationMessage('Please enter an API key!');
                return false;
            }
            API_KEY = inputValue;
            return inputValue;
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {}
        // console.log(API_KEY);
    });
};

apiKeySwal();

chatInput = document.querySelector("#chat-input");
let sendButton = document.querySelector("#send-btn");
let chatContainer = document.querySelector(".chat-container");
let themeButton = document.querySelector("#theme-btn");
let deleteButton = document.querySelector("#delete-btn");

let userText = null;

let loadDataFromLocalstorage = () => {
    let themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    let defaultText = `<div class="default-text">
                            <h1>ChatGPT Clone</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.</p>
                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

let createChatElement = (content, className) => {
    let chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
}

let getChatResponse = async(incomingChatDiv) => {
    let API_URL = "https://api.openai.com/v1/completions";
    let pElement = document.createElement("p");

    // define data for the API request
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

    try {
        let response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong. Please enter an API Key Or try diferent API key Or contact the developer on this number +92 313 0019086.";
    }
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

let copyResponse = (copyBtn) => {
    let reponseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

let showTypingAnimation = () => {
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
    let incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

let handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    let html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="./assets/user.jpg" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

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
    Swal.fire({
        title: 'Do you want to clear chat ?',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        confirmButtonColor: "#343541",
        cancelButtonColor: "#343541"
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("all-chats");
            loadDataFromLocalstorage();
        }
    })

});

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

let initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
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