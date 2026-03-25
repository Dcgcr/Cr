

// SUPABASE CONNECTION
const supabaseClient = supabase.createClient(
  "https://dxqswppjpkzahapkciyg.supabase.co",
  "sb_publishable_JqM8sCYJ4IoEBDs8XXqnbQ_4h0Lj6mq"
);

// SPLASH SCREEN (2 seconds)
setTimeout(() => {
  document.getElementById("splash").style.display = "none";
}, 2000);

// LONG PRESS (3 seconds)
let timer;
const topBar = document.getElementById("topBar");

topBar.addEventListener("mousedown", () => {
  timer = setTimeout(() => {
    document.getElementById("uploadPage").style.display = "block";
  }, 3000);
});

topBar.addEventListener("mouseup", () => clearTimeout(timer));

// UPLOAD ELEMENTS
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const captionInput = document.getElementById("captionInput");
const confirmBtn = document.getElementById("confirmBtn");

let selectedFile = null;

// SELECT IMAGE
uploadBox.onclick = () => fileInput.click();

fileInput.onchange = () => {
  selectedFile = fileInput.files[0];

  const reader = new FileReader();
  reader.onload = () => {
    uploadBox.innerHTML =
      `<img src="${reader.result}" style="width:100%;height:100%;object-fit:cover;">`;
  };
  reader.readAsDataURL(selectedFile);
};

// SHOW CONFIRM WHEN TEXT ENTERED
captionInput.oninput = () => {
  if (captionInput.value.trim() !== "") {
    confirmBtn.style.display = "block";
  }
};

// CONFIRM UPLOAD
confirmBtn.onclick = async () => {
  const fileName = Date.now() + "_" + selectedFile.name;

  // Upload image
  const { error } = await supabaseClient.storage
    .from("clothes-images")
    .upload(fileName, selectedFile);

  if (error) {
    alert("Upload failed");
    return;
  }

  const { data } = supabaseClient.storage
    .from("clothes-images")
    .getPublicUrl(fileName);

  // Save to DB
  await supabaseClient.from("clothes").insert([
    {
      image_url: data.publicUrl,
      caption: captionInput.value
    }
  ]);

  location.reload();
};

// LOAD DATA FROM DATABASE
async function loadImages() {
  const { data } = await supabaseClient
    .from("clothes")
    .select("*")
    .order("created_at", { ascending: false });

  const container = document.getElementById("container");

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${item.image_url}">
      <div class="caption">${item.caption}</div>
    `;

    container.appendChild(card);
  });
}

loadImages();




    