import { registerEnumType } from '@nestjs/graphql';

export enum DoorPosition {
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_CENTER = 'BOTTOM_CENTER',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  LEFT_BOTTOM = 'LEFT_BOTTOM',
  LEFT_CENTER = 'LEFT_CENTER',
  LEFT_TOP = 'LEFT_TOP',
  RIGHT_BOTTOM = 'RIGHT_BOTTOM',
  RIGHT_CENTER = 'RIGHT_CENTER',
  RIGHT_TOP = 'RIGHT_TOP',
  TOP_LEFT = 'TOP_LEFT',
  TOP_CENTER = 'TOP_CENTER',
  TOP_RIGHT = 'TOP_RIGHT',
}

registerEnumType(DoorPosition, {
  name: 'DoorPosition',
  description: 'Door position types',
});
