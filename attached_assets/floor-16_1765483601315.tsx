
import { Blueprint } from './blueprints/floor-16';
import { Room } from './Room';
import type { Room as RoomType } from '@/lib/types';
import React from 'react';

export const id = '16';
export const name = 'Hacker Lounge & Tables';
export const level = 16;
export const rooms: RoomType[] = [];

interface Floor16Props {
  highlightedRoomId: string | null;
  onRoomClick: (roomId: string | null) => void;
  rooms: RoomType[];
  onMouseEnterRoom: (room: RoomType) => void;
  onMouseLeaveRoom: () => void;
  viewBox: string;
}

export const Floor16: React.FC<Floor16Props> = ({ highlightedRoomId, onRoomClick, rooms, onMouseEnterRoom, onMouseLeaveRoom, viewBox }) => {

  return (
    <g data-floor-id="16">
      <Blueprint />
      {rooms.map(room => (
        <Room
          key={room.id}
          id={room.id}
          name={room.name}
          teamName={room.teamName}
          coords={room.coords} // Use coords from room
          color={room.color} // Use color from room
          notes={room.notes}
          floorId={id} // Use the floor's constant id
          viewBox={viewBox}
          onMouseEnter={() => onMouseEnterRoom(room)}
          onMouseLeave={onMouseLeaveRoom}
          onClick={() => onRoomClick(room.id)}
        />
      ))}
    </g>
  );
};
