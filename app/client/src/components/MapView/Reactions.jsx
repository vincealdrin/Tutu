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
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon/Icon';

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
        <Tooltip
          trigger="click"
          html={
            <div className="reaction-alert">
              <p>
                {status.success && !status.pending
                ?
                  <span><Icon name="check" color="green" />Success</span>
                :
                  <span>
                    <Icon name="close" color="red" />
                    {status.errorMessage}
                  </span>
                }
              </p>
            </div>
          }
        >
          <Image
            src={happyReact}
            onClick={() => updateReaction('happy')}
          />
        </Tooltip>
      </Tooltip>
      {happy}
    </List.Item>
    <List.Item className="reactions">
      <Tooltip title="Amused">
        <Tooltip
          trigger="click"
          html={
            <div className="reaction-alert">
              <p>
                {status.success && !status.pending
                ?
                  <span><Icon name="check" color="green" />Success</span>
                :
                  <span>
                    <Icon name="close" color="red" />
                    {status.errorMessage}
                  </span>
                }
              </p>
            </div>
          }
        >
          <Image
            src={amusedReact}
            onClick={() => updateReaction('amused')}
          />
        </Tooltip>
      </Tooltip>
      {amused}
    </List.Item>
    <List.Item className="reactions">
      <Tooltip title="Inspired">
        <Tooltip
          trigger="click"
          html={
            <div className="reaction-alert">
              <p>
                {status.success && !status.pending
                ?
                  <span><Icon name="check" color="green" />Success</span>
                :
                  <span>
                    <Icon name="close" color="red" />
                    {status.errorMessage}
                  </span>
                }
              </p>
            </div>
          }
        >
          <Image
            src={inspiredReact}
            onClick={() => updateReaction('inspired')}
          />
        </Tooltip>
      </Tooltip>
      {inspired}
    </List.Item>
    <List.Item className="reactions">
      <Tooltip title="Afraid">
        <Tooltip
          trigger="click"
          html={
            <div className="reaction-alert">
              <p>
                {status.success && !status.pending
                ?
                  <span><Icon name="check" color="green" />Success</span>
                :
                  <span>
                    <Icon name="close" color="red" />
                    {status.errorMessage}
                  </span>
                }
              </p>
            </div>
          }
        >
          <Image
            src={afraidReact}
            onClick={() => updateReaction('afraid')}
          />
        </Tooltip>
      </Tooltip>
      {afraid}
    </List.Item>
    <List.Item className="reactions">
      <Tooltip title="Sad">
        <Tooltip
          trigger="click"
          html={
            <div className="reaction-alert">
              <p>
                {status.success && !status.pending
                ?
                  <span><Icon name="check" color="green" />Success</span>
                :
                  <span>
                    <Icon name="close" color="red" />
                    {status.errorMessage}
                  </span>
                }
              </p>
            </div>
          }
        >
          <Image
            src={sadReact}
            onClick={() => updateReaction('sad')}
          />
        </Tooltip>
      </Tooltip>
      {sad}
    </List.Item>
    <List.Item className="reactions">
      <Tooltip title="Angry">
        <Tooltip
          trigger="click"
          html={
            <div className="reaction-alert">
              <p>
                {status.success && !status.pending
                ?
                  <span><Icon name="check" color="green" />Success</span>
                :
                  <span>
                    <Icon name="close" color="red" />
                    {status.errorMessage}
                  </span>
                }
              </p>
            </div>
          }
        >
          <Image
            src={angryReact}
            onClick={() => updateReaction('angry')}
          />
        </Tooltip>
      </Tooltip>
      {angry}
    </List.Item>
  </List>
);

export default Reactions;
