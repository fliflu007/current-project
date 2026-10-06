import { ImageItemType } from "../page";

type ImageItemProps = {
  image: ImageItemType;
  onRemove: () => void;
  onSetMain: () => void;
};

export default function ImageItem({
  image,
  onRemove,
  onSetMain,
}: ImageItemProps) {
  return (
    <div className="relative w-32 rounded-md border p-2">
      <img
        src={image.previewUrl}
        alt="Product preview"
        className="h-24 w-full rounded object-cover"
      />

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onSetMain}
          className={`rounded border px-2 py-1 text-sm ${
            image.isMain ? "border-primary" : "border-transparent"
          }`}
        >
          Main
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="rounded border px-2 py-1 text-sm"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
