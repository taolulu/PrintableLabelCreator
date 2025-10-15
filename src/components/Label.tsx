import { ImageWithFallback } from "./figma/ImageWithFallback";
// We'll use a standard import for the logo now.
import newLogoImage from "../assets/workshop-logo.png";

// Define the props interface for type safety and clarity
export interface LabelProps {
  projectName?: string;
  title?: string;
  imageUrl?: string;
}

export function Label({
  projectName = "Lyra Project",
  title = "高端商务礼盒",
  imageUrl = "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
}: LabelProps) {
  return (
    <div 
      className="bg-white border border-gray-400 flex"
      style={{ 
        width: '105mm', 
        height: '49.5mm',
        padding: '4mm',
        alignItems: 'center'
      }}
    >
      {/* 左侧文本区域 */}
      <div className="flex-1 flex flex-col justify-center" style={{ paddingRight: '32px' }}>
        <div className="flex flex-col">
          {/* 第一行：图标 + 小字号文本 */}
          <div className="flex items-center">
            <img 
              src={newLogoImage}
              alt="Logo"
              className="flex-shrink-0"
              style={{
                width: '30px',
                height: '30px',
                // A more versatile filter for dark logos
                filter: 'brightness(0) saturate(100%)'
              }}
            />
            <span 
              className="text-sm text-gray-700 tracking-wide"
              style={{
                fontFamily: '"Cascadia Code", "Cascadia Mono", monospace',
                fontStyle: 'italic',
                marginLeft: '12px'
              }}
            >
              {projectName}
            </span>
          </div>
          
          {/* 装饰分隔符 */}
          <div className="flex items-center" style={{ marginTop: '16px' }}>
            <div className="flex-1 h-px bg-[#999999]" />
          </div>
          
          {/* 第二行：大字号文本 */}
          <div className="mt-2">
            <h2 className="text-3xl text-gray-900 tracking-tight">{title}</h2>
          </div>
        </div>
      </div>
      
      {/* 右侧图片区域 */}
      <div className="flex items-center justify-center">
        <div 
          className="bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden"
          style={{
            width: 'calc(49.5mm - 12mm)',
            height: 'calc(49.5mm - 12mm)'
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
