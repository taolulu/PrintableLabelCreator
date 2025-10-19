import { ImageWithFallback } from "./figma/ImageWithFallback";
import newLogoImage from "../assets/workshop-logo.png";

// Define the props interface for type safety and clarity
export interface LabelProps {
  projectName?: string;
  title?: string;
  imageUrl?: string;
  hideBorders?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export function Label({
  projectName = "Lyra Project",
  title = "高端商务礼盒",
  imageUrl = "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
  hideBorders = false,
  isSelected = false,
  onClick,
}: LabelProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white flex p-[4mm] transition-all duration-150 ${hideBorders ? '' : 'border border-gray-300'} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        width: '105mm',
        height: '49.5mm',
        boxSizing: 'border-box',
      }}
    >
      {/* Left text area */}
      <div className="flex-1 flex flex-col justify-center pr-8">
        <div className="flex flex-col gap-3">
          {/* First row: icon + small text */}
          <div className="flex items-center gap-3">
            <img
              src={newLogoImage}
              alt="Logo"
              className="shrink-0"
              style={{ // Keep size style for precise mm control if needed
                width: '30px',
                height: '30px',
                filter: 'brightness(0) saturate(100%)',
              }}
            />
            <span
              className="text-sm font-mono italic text-gray-600 tracking-wide"
            >
              {projectName}
            </span>
          </div>

          {/* Decorative separator */}
          <div className="border-t border-gray-200" />

          {/* Second row: large text */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
          </div>
        </div>
      </div>

      {/* Right image area */}
      <div className="flex items-center justify-center">
        <div
          className={`bg-gray-50 flex items-center justify-center overflow-hidden rounded-md ${hideBorders ? '' : 'border border-gray-200'}`}
          style={{
            width: 'calc(49.5mm - 12mm)',
            height: 'calc(49.5mm - 12mm)',
          }}
        >
          <ImageWithFallback
            src={imageUrl}
            alt="模型示意图"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}