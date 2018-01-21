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
              TUTÛ: A Web-based Interactive Map of Credible News Outlets in the Philippines
            </Header>

            <p className="tutu-description" >
              TUTÛ is an interactive map of credible news outlets in the Philippines.
              We crawl news sites for articles and basically check if the site is credible or not,
              through the articles in the site, keywords used, and the sitemap structure of the site.
              TUTÛ stores articles gathered in a database and archives it for the future.
            </p>

            <Divider style={{ width: 100, margin: '2.3rem 0' }} />

            <section className="social-media">
              <Icon name="facebook" size="large" />
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
