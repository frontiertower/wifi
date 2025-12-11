
import { Blueprint } from './blueprints/floor-7';
import { Room } from './Room';
import type { Room as RoomType } from '@/lib/types';

export const id = '7';
export const name = 'Makerspace - Hacker Desk Area';
export const level = 7;
export const rooms: RoomType[] = [];

interface Floor7Props {
  highlightedRoomId: string | null;
  onRoomClick: (roomId: string | null) => void;
  rooms: RoomType[];
  onMouseEnterRoom: (room: RoomType) => void;
  onMouseLeaveRoom: () => void;
  viewBox: string;
}

export const Floor7: React.FC<Floor7Props> = ({ highlightedRoomId, onRoomClick, rooms, onMouseEnterRoom, onMouseLeaveRoom, viewBox }) => {

  return (
    <g data-floor-id="7">
      <Blueprint />
      {/* Map over rooms array to render Room components */}
      {rooms.map(room => (
        <Room
          key={room.id}
          id={room.id}
          name={room.name}
          teamName={room.teamName}
          coords={room.coords} // Use coords from room data
          color={room.color} // Use color from room data
          notes={room.notes}
          floorId={id} // Use the floor's constant id
          viewBox={viewBox}
          onMouseEnter={() => onMouseEnterRoom(room)}
          onMouseLeave={onMouseLeaveRoom}
          onClick={() => onRoomClick(room.id)} // Use onRoomClick prop
        />
      ))}
    </g>
  );
};
