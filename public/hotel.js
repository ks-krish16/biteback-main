document.getElementById("submitBtn").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevents form submission
    uploadPost();
});

const username = localStorage.getItem("username");
const email = localStorage.getItem("email");
async function uploadPost() {
    const formData = new FormData();
    formData.append("user",username);
    formData.append("email",email);
    formData.append("foodname", document.getElementById("foodName").value);
    formData.append("quantity", document.getElementById("quantity").value);
    formData.append("contact", document.getElementById("number").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("image", document.getElementById("file-input").files[0]);

    try {
        const response = await fetch('https://biteback-h3mz.onrender.com/upload', {
            method: 'POST',
            body:formData
        });
        console.log("Sending Data:", Object.fromEntries(formData));
    
    if (response.ok) {
        alert("Post submitted successfully!");
        window.location.href = "/postDetailsPage";
    } else {
        alert("Error submitting post.");
    }
} catch (error) {
    console.error("Error:", error);
}
}  
