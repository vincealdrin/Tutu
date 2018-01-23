import React, { Component } from 'react';
import {
  List,
  Image,
  Icon,
} from 'semantic-ui-react';
import { Tooltip } from 'react-tippy';
import axios from 'axios';
import happyReact from '../../assets/reactions/5.svg';
import amusedReact from '../../assets/reactions/4.svg';
import inspiredReact from '../../assets/reactions/3.svg';
import afraidReact from '../../assets/reactions/2.svg';
import sadReact from '../../assets/reactions/1.svg';
import angryReact from '../../assets/reactions/0.svg';
import { crudStatus, updateCrudStatus } from '../../utils';

class Reactions extends Component {
  constructor(props) {
    super(props);
    const { reactions } = this.props;

    this.state = {
      status: crudStatus,
      reactions: {
        happy: 0,
        amused: 0,
        sad: 0,
        inspired: 0,
        afraid: 0,
        angry: 0,
        ...reactions,
      },
    };
  }

  timeoutId = null;

  updateReaction = async (reaction) => {
    const { id } = this.props;
    const { reactions } = this.state;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    try {
      this.setState({
        status: updateCrudStatus({ statusText: 'pending' }),
      });

      const { status } = await axios.put('/articles/reactions', {
        id,
        reaction,
      });

      this.setState({
        reactions: {
          ...reactions,
          [reaction]: reactions[reaction] + 1,
        },
        status: updateCrudStatus({
          statusText: 'success',
          status,
        }),
      });
    } catch (e) {
      this.setState({
        status: updateCrudStatus({
          statusText: 'error',
          errorMessage: e.response.data.message,
          status: e.response.status,
        }),
      });
    }

    this.timeoutId = setTimeout(() => {
      this.setState({ status: crudStatus });
    }, 1500);
  }

  render() {
    const {
      status,
      reactions: {
        happy,
        amused,
        sad,
        inspired,
        afraid,
        angry,
      },
    } = this.state;
    const successMsg = status.success && !status.pending ? (
      <span>
        <Icon name="check" color="green" /> Success
      </span>
    ) : null;
    const errorMsg = status.error && !status.pending ? (
      <span>
        <Icon name="warning sign" color="yellow" /> {status.errorMessage}
      </span>
    ) : null;

    return (
      <Tooltip
        open={(status.success || status.error) && !status.pending}
        html={successMsg || errorMsg}
        position="top"
      >
        <List horizontal className="reaction-container">
          <List.Item className="reactions">
            <Tooltip
              title="Happy"
              distance={-8}
              duration={175}
            >
              <Image
                src={happyReact}
                onClick={async () => this.updateReaction('happy')}
              />
              {happy}
            </Tooltip>
          </List.Item>
          <List.Item className="reactions">

            <Tooltip
              title="Amused"
              distance={-8}
              duration={175}
            >
              <Image
                src={amusedReact}
                onClick={async () => this.updateReaction('amused')}
              />
            </Tooltip>
            {amused}
          </List.Item>
          <List.Item className="reactions">
            <Tooltip
              title="Inspired"
              distance={-8}
              duration={175}
            >
              <Image
                src={inspiredReact}
                onClick={async () => this.updateReaction('inspired')}
              />
            </Tooltip>
            {inspired}
          </List.Item>
          <List.Item className="reactions">
            <Tooltip
              title="Afraid"
              distance={-8}
              duration={175}
            >
              <Image
                src={afraidReact}
                onClick={async () => this.updateReaction('afraid')}
              />
            </Tooltip>
            {afraid}
          </List.Item>
          <List.Item className="reactions">
            <Tooltip
              title="Sad"
              distance={-8}
              duration={175}
            >
              <Image
                src={sadReact}
                onClick={async () => this.updateReaction('sad')}
              />
            </Tooltip>
            {sad}
          </List.Item>
          <List.Item className="reactions">
            <Tooltip
              title="Angry"
              distance={-8}
              duration={175}
            >
              <Image
                src={angryReact}
                onClick={async () => this.updateReaction('angry')}
              />
            </Tooltip>
            {angry}
          </List.Item>
        </List>
      </Tooltip>
    );
  }
}

export default Reactions;
