import React, { Component } from 'react';
import { Segment, Label, Icon, Header, Divider, List } from 'semantic-ui-react';
import './style.css';
import { Link } from 'react-router-dom';

class About extends Component {
  render() {
    return (
      <div className="about-section-container">
        <Segment>
          <Label as="a" color="red" ribbon style={{ marginBottom: '1rem' }}>Top News</Label>
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
                  Vince Cabrera | <Link to="https://github.com/vincealdrin" target="_blank">github/vincealdrin</Link>
                </List.Item>
                <List.Item>
                  Francis Taberdo | <Link to="https://github.com/francistaberdo" target="_blank">github/francistaberdo</Link>
                </List.Item>
                <List.Item>
                  Iah Buenacosa | <Link to="https://github.com/iahello" target="_blank">github/iahello</Link>
                </List.Item>
                <List.Item>
                  Gabriel Ocampo | <Link to="https://fb.com/gbrlbrrl" target="_blank">github/gbrlbrrl</Link>
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
