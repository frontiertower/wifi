import { Blueprint } from './blueprints/floor-3';
import type { Room } from '@/lib/types';

export const id = '3';
export const name = 'Fitness Center';
export const level = 3;
export const rooms: Room[] = [];

export const Floor3 = () => {
  return (
    <g>
      <Blueprint />
      <text x="25" y="12.5" dominantBaseline="middle" textAnchor="middle" className="pointer-events-none font-sans text-[4px]">Floor 3</text>
    </g>
  );
};
