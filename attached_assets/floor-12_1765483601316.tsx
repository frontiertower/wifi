
import { Blueprint } from './blueprints/floor-12';
import { Room } from './Room';
import type { Room as RoomType } from '@/lib/types';
import React from 'react';

export const id = '12';
export const name = 'Ethereum House - Hack Space';
export const level = 12;
export const rooms: RoomType[] = [];

interface Floor12Props {
  highlightedRoomId: string | null;
  onRoomClick: (roomId: string | null) => void;
  rooms: RoomType[];
  onMouseEnterRoom: (room: RoomType) => void;
  onMouseLeaveRoom: () => void;
  viewBox: string;
}

export const Floor12: React.FC<Floor12Props> = ({ highlightedRoomId, onRoomClick, rooms, onMouseEnterRoom, onMouseLeaveRoom, viewBox }) => {
   
  return (
    <g data-floor-id="12">
      <Blueprint />
      {rooms.map(room => (
        <Room
          key={room.id}
          id={room.id}
          name={room.name}
          teamName={room.teamName}
          coords={room.coords} // Use coords from roomData
          color={room.color} // Use color from roomData
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
