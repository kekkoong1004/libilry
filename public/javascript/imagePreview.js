const imageFile = document.getElementById("imageFile")
const previewContainer = document.getElementById("imagePreview")
const previewImage = document.querySelector(".image-preview-image")
const previewText = document.querySelector(".image-preview-text")




imageFile.addEventListener("change", function() {
  const file = this.files[0]
  if (file) {
    const reader = new FileReader()

    previewText.style.display = "none";
    previewImage.style.display = "block"

    reader.addEventListener('load', function() {
      previewImage.setAttribute('src', this.result)
    })

    reader.readAsDataURL(file)
  } else {
    previewText.style.display = null;
    previewImage.style.display = null;
    previewImage.setAttribute('src', "")
  }
})