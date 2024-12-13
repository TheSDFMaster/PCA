var modal = document.getElementById("modal");
var btn = document.getElementById("options");
var span = document.getElementsByClassName("close")[0];
var popup = document.getElementById("optionsPopup");
const file = document.getElementById('bgUpload');
const frame = document.body;
const dropdowns = document.querySelectorAll('.dropdown');
let db;
const request = indexedDB.open("ImageDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("images")) {
    db.createObjectStore("images", { keyPath: "id" });
  }
};

request.onsuccess = function (event) {
  db = event.target.result;
  loadSavedImage();
};

request.onerror = function (event) {
  console.log("IndexedDB error:", event);
};

function saveImage(blob) {
  const transaction = db.transaction(["images"], "readwrite");
  const objectStore = transaction.objectStore("images");
  const request = objectStore.put({ id: "bgImage", image: blob });
  request.onsuccess = function () {
    console.log("Image saved to IndexedDB.");
  };
  request.onerror = function (event) {
    console.log("Error saving image:", event);
  };
}

function loadSavedImage() {
  const transaction = db.transaction(["images"], "readonly");
  const objectStore = transaction.objectStore("images");
  const request = objectStore.get("bgImage");
  request.onsuccess = function (event) {
    const result = event.target.result;
    if (result) {
      const blob = result.image;
      const url = URL.createObjectURL(blob);
      frame.style.backgroundImage = `url(${url})`;
    }
  };
  request.onerror = function (event) {
    console.log("Error loading image:", event);
  };
}

dropdowns.forEach(dropdown => {
  const select = dropdown.querySelector('.select');
  const caret = dropdown.querySelector('.caret');
  const menu = dropdown.querySelector('.menu');
  const options = dropdown.querySelectorAll('.menu li');
  const selected = dropdown.querySelector('.selected');
  select.addEventListener('click', () => {
    select.classList.toggle('select-clicked');
    caret.classList.toggle('caret-rotate');
    menu.classList.toggle('menu-open');
  });
  options.forEach(option => {
    option.addEventListener('click', () => {
      selected.innerText = option.innerText;
      frame.style.backgroundPosition = selected.innerText.toLowerCase() + " center";
      caret.classList.remove('caret-rotate');
      select.classList.remove('select-clicked');
      menu.classList.remove('menu-open');
      options.forEach(option => {
        option.classList.remove('active');
      });
      option.classList.add('active');
    });
  });
});

btn.onclick = function () {
  modal.style.display = "flex";
  popup.style.display = "flex";
};

span.onclick = function () {
  modal.style.display = "none";
  popup.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

file.addEventListener('change', function () {
  const image = this.files[0];
  if (image) {
    const reader = new FileReader();
    reader.onload = function () {
      const blob = new Blob([reader.result], { type: image.type });
      frame.style.backgroundImage = `url(${URL.createObjectURL(blob)})`;

      saveImage(blob);
    };
    reader.readAsArrayBuffer(image);
  }
}, false);