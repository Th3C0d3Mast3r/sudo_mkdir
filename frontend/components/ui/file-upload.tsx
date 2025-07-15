import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  value,
}: {
  onChange?: (files: File[]) => void;
  value?: File;
}) => {
  const [files, setFiles] = useState<File[]>(value ? [value] : []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setFiles([value]);
      if (value.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(value);
      } else {
        setPreview(null);
      }
    } else {
      setFiles([]);
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (newFiles: File[]) => {
    if (!newFiles.length) {
      setFiles([]);
      setPreview(null);
      onChange && onChange([]);
      return;
    }
    const file = newFiles[0];
    setFiles([file]);
    onChange && onChange([file]);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleRemove = () => {
    setFiles([]);
    setPreview(null);
    onChange && onChange([]);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-5 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          {files.length === 0 && (
            <div className="flex flex-col items-center justify-center">
              <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
                Upload file
              </p>
              <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
                Drag or drop your image here or click to upload
              </p>
            </div>
          )}
          <div className="relative w-full mt-4 max-w-xl mx-auto">
            {files.length > 0 && (
              <motion.div
                layoutId="file-upload"
                className={cn(
                  "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-center justify-center md:h-50 p-4 mt-4 w-full mx-auto rounded-md",
                  "shadow-sm"
                )}
              >
                {/* Remove button in top-right */}
                <button
                  type="button"
                  className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 rounded p-1 z-50"
                  onClick={handleRemove}
                  aria-label="Remove image"
                >
                  <IconX className="w-5 h-5" />
                </button>
                {preview ? (
                  <img
                    src={preview}
                    alt={files[0].name}
                    className="max-h-40 max-w-full rounded mb-2 object-contain"
                  />
                ) : (
                  <span className="text-neutral-400">No preview available</span>
                )}
                {/* Metadata UI */}
                <div className="flex flex-col items-center w-full gap-2 mt-1">
                  <div className="flex flex-wrap gap-2 items-center justify-center">
                    <span className="bg-muted text-xs px-2 py-1 rounded font-mono text-neutral-700 dark:text-neutral-200">
                      {files[0].name}
                    </span>
                    <span className="bg-orange-100 text-xs px-2 py-1 rounded font-mono text-orange-700">
                      {(files[0].size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span className="bg-purple-100 text-xs px-2 py-1 rounded font-mono text-purple-700">
                      {files[0].type}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-24 mt-4 w-full max-w-[6rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}
            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-primary inset-0 z-30 bg-transparent flex items-center justify-center h-24 mt-4 w-full max-w-[6rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
