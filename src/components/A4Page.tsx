import React from 'react';
import { Label } from './Label';
import { IndividualLabel } from '../App';

interface A4PageProps {
  labels: IndividualLabel[];
  projectName: string;
}

export const A4Page: React.FC<A4PageProps> = ({ labels, projectName }) => {
  return (
    <div
      id="a4-page"
      style={{
        width: '210mm',
        height: '297mm',
        backgroundColor: 'white',
        position: 'relative',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        margin: '0 auto',
      }}
      className="print:shadow-none"
    >
      {labels.map((label, index) => {
        const rowIndex = Math.floor(index / 2);
        const colIndex = index % 2;
        // 49.5mm per row
        const top = `${rowIndex * 49.5}mm`;
        // 105mm per column
        const left = `${colIndex * 105}mm`;

        return (
          <div
            key={label.id}
            style={{
              position: 'absolute',
              top: top,
              left: left,
            }}
          >
            <Label
              projectName={projectName}
              title={label.title}
              id={label.id}
              imageUrl={label.imageUrl}
              titleFontSize={label.titleFontSize}
              hideBorders={true}
            />
          </div>
        );
      })}
    </div>
  );
};
