"use client";

interface ProfilePhotoProps {
  src?: string;
  alt?: string;
  className?: string;
  placeholderClassName?: string;
  placeholderText?: string;
}

export function ProfilePhoto({
  src,
  alt = "Profile",
  className = "w-full h-full object-cover",
  placeholderClassName = "",
  placeholderText = "Photo",
}: ProfilePhotoProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <span className={placeholderClassName}>{placeholderText}</span>
  );
}
