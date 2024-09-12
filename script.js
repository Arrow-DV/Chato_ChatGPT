let btn = document.getElementById("send");
let lastRequestTime = 0;
let cooldown = 2000; // 2-second delay

btn.addEventListener("click", function() {
    let currentTime = Date.now();
    if (currentTime - lastRequestTime < cooldown) {
        console.log("Too many requests. Please wait a moment.");
        return; // Prevent further execution if still in cooldown
    }

    let message = document.getElementById("msg").value;
    AppendToChatLog(message, true);
    sendGPT(message);
    lastRequestTime = currentTime;
    btn.disabled = true; // Disable button while waiting for response

    setTimeout(() => {
        btn.disabled = false;
    }, cooldown);
});

function AppendToChatLog(msg, user) {
    let Element = document.createElement("p");
    Element.innerText = user ? "You: " + msg : "ChatGPT: " + msg;
    Element.style.textAlign = "left";
    document.getElementById("chatlog").append(Element);
}

function sendGPT(msg, retryCount = 0) {
    let body = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": msg}]
    };
    let headers = {
        Authorization: "Bearer API_KEY"
    };

    axios.post("https://api.openai.com/v1/chat/completions", body, { headers })
    .then((response) => {
        let reply = response.data.choices[0].message.content;
        AppendToChatLog(reply, false);
    })
    .catch((error) => {
        if (error.response && error.response.status === 429) {
            if (retryCount < 5) { // Retry up to 5 times
                let waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
                setTimeout(() => sendGPT(msg, retryCount + 1), waitTime);
            } else {
                console.error("Error 429: Too many requests. Please slow down.");
            }
        } else {
            console.error("Error:", error);
        }
    });
}