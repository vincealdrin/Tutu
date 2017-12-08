import React, { Component } from 'react';
import { List, Image, Popup } from 'semantic-ui-react';
import happy from './reactions/5.svg';
import medyoHappy from './reactions/4.svg';
import somewhatHappy from './reactions/3.svg';
import notThatHappy from './reactions/2.svg';
import neutral from './reactions/1.svg';
import notHappy from './reactions/0.svg';
import angry from './reactions/-1.svg';

class Reactions extends Component {
  handleClick = () => {
    console.log('clicked sentiment');
  }
  render() {
    const reactions = [happy, medyoHappy, somewhatHappy, notThatHappy, neutral, notHappy, angry];

    return (
      <div>
        <List horizontal>
          {reactions.map((sentimentItem) => (
            <Popup
              trigger={
                <List.Item className="reactions">
                  <Image src={sentimentItem} onClick={this.handleClick} />
                </List.Item>
              }
              position="top center"
            >
              Reaction
            </Popup>
          ))}
        </List>
      </div>
    );
  }
}

export default Reactions;
