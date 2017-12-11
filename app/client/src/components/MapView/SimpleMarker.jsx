import React, { PureComponent } from 'react';
import { Label, List, Popup, Header, Icon, Image, Button, Accordion } from 'semantic-ui-react';
import shortid from 'shortid';
import { Tooltip } from 'react-tippy';
import Reactions from './Reactions';
import { Motion, spring } from 'react-motion';
import MarkerAccordion from './MarkerAccordion';
import './styles.css';

const config = { stiffness: 140, damping: 14 };
const toCSS = (translateX) => ({ transform: `translateX: ${translateX}px` });

class SimpleMarker extends PureComponent {
  render() {
    const {
      title,
      url,
      publishDate,
      $hover,
    } = this.props;

    return (
      <Tooltip
        position="right-start"
        className="this-tooltip"
        html={
          <div>
            <a href={url} target="_blank">{title}</a>
            <p>{new Date(publishDate).toLocaleDateString()}</p>
          </div>
        }
        open={$hover}
        arrow
        sticky
      >
        <Motion
          defaultStyle={{
            top: 220,
            x: 0,
          }}
          style={{
            top: spring(0, config),
            x: spring(10, config),
          }}
        >
          {(v) => {
            console.log();
            return (
              <div>
                {v.x}
                <Icon
                  color="red"
                  name="marker"
                  size={$hover ? 'huge' : 'big'}
                  className={`marker ${$hover ? 'hovered' : ''}`}
                  style={toCSS(v.translateX)}
                />
              </div>
            );
          }}
        </Motion>
      </Tooltip>
    );
  }
}

export default SimpleMarker;
