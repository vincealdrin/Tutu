import React, { Component } from 'react';
import { Segment, Label, Icon, Header, Divider, List } from 'semantic-ui-react';
import './style.css';

class About extends Component {
  render() {
    return (
      <div>
        <Segment>
          <Label as="a" color="red" ribbon style={{ marginBottom: '1rem' }}>About</Label>
          <div className="scrollable-section about-section-info">
            <Header as="h2" style={{ marginBottom: 32 }}>
              TUTÛ: Interactive Map of Philippines&apos; Credible News
            </Header>

            <p className="tutu-description" >
            TUTÛ is an interactive map of articles from news portals in the Philippines.
            It aggregates articles from our list of news portals (vetted by veteran journalists) and extracts information in each articles through Natural Language Processing. TUTÛ also features a news portal analyzer which scores the credibility of a news portal and its content using a trained machine-learning model.
            </p>

            <Divider style={{ width: 100, margin: '2.3rem 0' }} />

            <section className="social-media">
              <Icon
                name="facebook"
                size="large"
                as="a"
                href="https://fb.com/tutunewsph"
              />
              <Icon name="twitter" size="large" />
              <Icon name="mail" size="large" />
            </section>

            <section className="member-names">
              <List>
                <List.Item>
                  Vince Cabrera | <a href="https://github.com/vincealdrin" target="_blank">github/vincealdrin</a>
                </List.Item>
                <List.Item>
                  Francis Taberdo | <a href="https://github.com/francistaberdo" target="_blank">github/francistaberdo</a>
                </List.Item>
                <List.Item>
                  Iah Buenacosa | <a href="https://github.com/iahello" target="_blank">github/iahello</a>
                </List.Item>
                <List.Item>
                  Gabriel Ocampo | <a href="https://fb.com/gbrlbrrl" target="_blank">github/gbrlbrrl</a>
                </List.Item>
              </List>
            </section>
          </div>
        </Segment>
      </div>
    );
  }
}

export default About;
