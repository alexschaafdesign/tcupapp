import React, { useMemo } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";


registerPlugin(FilePondPluginImagePreview);

const CustomFilePond = ({
  files,
  setFiles,
  name,
  allowMultiple = true,
  maxFiles = 10,
}) => {
  const memoizedFiles = useMemo(() => files, [files]);

  return (
    <FilePond
      files={memoizedFiles}
      onupdatefiles={(fileItems) => {
        console.log("File items from FilePond:", fileItems);
        // Extract the raw File objects from FilePond
        const updatedFiles = fileItems.map((item) => item.file);
        console.log("Extracted Files:", updatedFiles);
        setFiles(updatedFiles);
      }}
      allowMultiple={allowMultiple}
      maxFiles={maxFiles}
      name={name}
      labelIdle={`Drag & Drop your ${name} or <span class="filepond--label-action">Browse</span>`}
      acceptedFileTypes={["image/png", "image/jpeg"]}
      instantUpload={false}  // We're manually uploading on form submit
    />
  );
};

export default CustomFilePond;