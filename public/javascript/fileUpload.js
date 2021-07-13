FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageEdit,
  FilePondPluginFileEncode
);

FilePond.setOptions({
  // stylePanelAspectRatio: 0.2
})

const inputElement = document.querySelector('input[type="file"]');

FilePond.create(inputElement);