function getCurrentPage() {
    let path = window.location.pathname;
    let page = path.split("/").pop(); 
    
    if (page === "" || page === "index.html") return "Home";
    if (page === "games.html") return "Games";
    if (page === "updates.html") return "Updates";
    if (page === "register.html") return "Register";
    return "";
}

function games() {
    if (getCurrentPage() === "Games") {
        console.log("Already on games page, not refreshing");
        return;
    }
    window.location.href = "games.html";
}

function home() {
    if (getCurrentPage() === "Home") {
        console.log("Already on home page, not refreshing");
        return;
    }
    console.log("Navigating to home page");
    window.location.href = "index.html";
}

function updates() {
    if (getCurrentPage() === "Updates") {
        console.log("Already on updates page, not refreshing");
        return;
    }
    console.log("Navigating to updates page");
    window.location.href = "updates.html";
}

function account() {
    if (getCurrentPage() === "Account") {
        console.log("Already on updates page, not refreshing");
        return;
    }
    console.log("Navigating to account page");
    window.location.href = "account.html";
}

function signUp() {
    if (getCurrentPage() === "Register") {
        console.log("Already on register page, not refreshing");
        return;
    }

    console.log("Navigating to register page");
    window.location.href = "register.html";
}

document.getElementById("games-button").addEventListener("click", games);
document.getElementById("index-button").addEventListener("click", home);
document.getElementById("updates-button").addEventListener("click", updates);
document.getElementById("account-link").addEventListener("click", account);
document.getElementById("account-link-here").addEventListener("click", account);
document.getElementById("sign-up-button").addEventListener("click", signUp);

//reji was here