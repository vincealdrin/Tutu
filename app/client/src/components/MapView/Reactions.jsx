import React from 'react';
import {
  List,
  Image,
} from 'semantic-ui-react';
import { Tooltip } from 'react-tippy';
import happyReact from '../../assets/reactions/5.svg';
import amusedReact from '../../assets/reactions/4.svg';
import inspiredReact from '../../assets/reactions/3.svg';
import afraidReact from '../../assets/reactions/2.svg';
import sadReact from '../../assets/reactions/1.svg';
import angryReact from '../../assets/reactions/0.svg';

const Reactions = ({
  reactions: {
    happy,
    amused,
    sad,
    inspired,
    afraid,
    angry,
  },
  updateReaction,
  status,
}) => (
  <List horizontal>
    <List.Item className="reactions">
      <Tooltip title="Happy">
        <Image
          src={happyReact}
          onClick={() => updateReaction('happy')}
        />
      </Tooltip>
      {happy}

      {status.success && !status.pending ? 'Success' : ''}
      {status.errorMessage}
    </List.Item>
    <List.Item className="reactions">
      <Tooltip title="Amused">
        <Image
          src={amusedReact}
          onClick={() => updateReaction('amused')}
        />
      </Tooltip>
      {amused}
    </List.Item>
    <List.Item className="reactions">
      <Tooltip title="Inspired">
        <Image
          src={inspiredReact}
          onClick={() => updateReaction('inspired')}
        />
      </Tooltip>
      {inspired}
    </List.Item>
    <List.Item className="reactions">
      <Tooltip title="Afraid">
        <Image
          src={afraidReact}
          onClick={() => updateReaction('afraid')}
        />
      </Tooltip>
      {afraid}
    </List.Item>
    <List.Item className="reactions">
      <Tooltip title="Sad">
        <Image
          src={sadReact}
          onClick={() => updateReaction('sad')}
        />
      </Tooltip>
      {sad}
    </List.Item>
    <List.Item className="reactions">
      <Tooltip title="Angry">
        <Image
          src={angryReact}
          onClick={() => updateReaction('angry')}
        />
      </Tooltip>
      {angry}
    </List.Item>
  </List>
);

export default Reactions;
