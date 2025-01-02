// Query the elements
const file = document.getElementById('file');
const message = document.getElementsByClassName('message')[0];
document.getElementById('loading-1').style.display = 'none';
document.getElementById('loading-2').style.display = 'none';

file.addEventListener('change', function (e) {
    const files = e.target.files;
    if (files.length === 0) {
        message.innerHTML = '';
    }
    else {
        document.getElementById("file-name").innerHTML = `Selected File: <i>${files[0].name.substring(0, 20)}...</i>`
        if (files[0].size / 1024 > 500) {
            message.innerHTML = "File should not be greater than 500 KB."
        }
        else {
            const formData = new FormData();
            formData.append('file', files[0]);

            fetch('/upload', {
                method: 'POST',
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => console.log(data.message))
                .catch((error) => console.error(error));
        }
    }
    document.getElementById('btn-step-1').removeAttribute('disabled');
});

async function load_doc() {
    if (document.getElementById('loading-1').style.display == 'block') {
        return;
    }
    document.getElementById('loading-1').style.display = 'block';
    await fetch("/embeddings", {
        method: "GET",
    })
        .then(response => response.json())
        .then(data => document.getElementsByClassName("message")[0].innerText = "Document Loaded: " + data["success"]);

    document.getElementById('btn-step-2').removeAttribute('disabled');
    document.getElementById('loading-1').style.display = 'none';
}
async function get_response() {
    if (document.getElementById('loading-2').style.display == 'block') {
        return;
    }
    document.getElementById('loading-2').style.display = 'block';
    if (!document.getElementById("query").value) {
        return
    }
    data = { query: document.getElementById("query").value }
    await fetch("/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => document.getElementById("response").innerHTML = marked.parse(data.response.replaceAll("\n", "<br>")));
        document.getElementById('loading-2').style.display = 'none';
}
