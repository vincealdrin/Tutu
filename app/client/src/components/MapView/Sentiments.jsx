import React, { Component } from 'react';
import { List, Image, Popup } from 'semantic-ui-react';
import happy from './sentiments/5.svg';
import medyoHappy from './sentiments/4.svg';
import somewhatHappy from './sentiments/3.svg';
import notThatHappy from './sentiments/2.svg';
import neutral from './sentiments/1.svg';
import notHappy from './sentiments/0.svg';
import angry from './sentiments/-1.svg';

class Sentiments extends Component {
  handleClick = () => {
    console.log('clicked sentiment');
  }
  render() {
    const sentiments = [happy, medyoHappy, somewhatHappy, notThatHappy, neutral, notHappy, angry];

    return (
      <div>
        <List horizontal>
          {sentiments.map((sentimentItem) => (
            <Popup
              trigger={
                <List.Item className="sentiments">
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

export default Sentiments;
